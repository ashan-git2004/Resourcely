import { useEffect, useMemo, useState } from "react";
import { approveUser, getPendingUsers, rejectUser } from "../auth/authService";
import { useAuth } from "../../context/AuthContext";
import {
  AlertMessage,
  Badge,
  buttonClasses,
  EmptyState,
  getBadgeTone,
  inputClasses,
  FullBleedShell,
  PageHeader,
  Panel,
  SectionHeading,
  StatCard,
  TableShell,
} from "./AdminUi";

const availableRoles = [
  { value: "USER", label: "User (Student)" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];

const roleDescriptions = [
  ["User (Student)", "Can access campus facilities, create bookings, and report issues."],
  ["Technician", "Can handle check-ins, maintenance, and ticket operations."],
  ["Manager", "Can oversee operations and monitor resource usage workflows."],
  ["Admin", "Full system access, including approvals and platform-wide management."],
];

export default function AdminUsersPage() {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadPendingUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await getPendingUsers(auth?.token);
      setUsers(data || []);
      setSelectedRoles((prev) => {
        const next = { ...prev };
        (data || []).forEach((user) => {
          next[user.id] = prev[user.id] || "USER";
        });
        return next;
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(userId) {
    setBusyUserId(userId);
    setError("");
    setSuccessMessage("");
    try {
      const user = users.find((entry) => entry.id === userId);
      const nextRole = selectedRoles[userId] || "USER";
      await approveUser(userId, nextRole, auth?.token);
      setSuccessMessage(`Approved ${user?.email} with role ${nextRole}.`);
      setTimeout(() => loadPendingUsers(), 500);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyUserId("");
    }
  }

  async function handleReject(userId) {
    setBusyUserId(userId);
    setError("");
    setSuccessMessage("");
    try {
      const user = users.find((entry) => entry.id === userId);
      await rejectUser(userId, auth?.token);
      setSuccessMessage(`Rejected account for ${user?.email}.`);
      setTimeout(() => loadPendingUsers(), 500);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyUserId("");
    }
  }

  const providerSummary = useMemo(() => {
    return users.reduce(
      (accumulator, user) => {
        const key = user.provider || "LOCAL";
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      },
      { GOOGLE: 0, LOCAL: 0 }
    );
  }, [users]);

  return (
    <FullBleedShell>
      {/* px-14 py-18 sm:px-18 lg:px-22 */}
      <div className="space-y-6">
        <PageHeader
          // eyebrow="Admin workspace"
          title="Pending user approvals"
          description="Review new accounts, assign the correct role on first approval, and keep onboarding clear and consistent."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Pending accounts" value={String(users.length).padStart(2, "0")} helper="Awaiting review" icon="👥" />
          <StatCard label="Google sign-ins" value={String(providerSummary.GOOGLE || 0).padStart(2, "0")} helper="OAuth users" icon="🟦" />
          <StatCard label="Credential sign-ins" value={String(providerSummary.LOCAL || 0).padStart(2, "0")} helper="Email & password" icon="🔐" />
        </div>

        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
        {successMessage ? <AlertMessage type="success">{successMessage}</AlertMessage> : null}

        <Panel className="space-y-6">
          <SectionHeading
            title="Approval queue"
            description="Assign a role before approving so new users land in the right workspace immediately."
          />

          {loading ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
              Loading pending users...
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No pending users"
              description="All accounts have been reviewed. New requests will appear here automatically."
            />
          ) : (
            <TableShell>
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assign role</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => {
                    const isBusy = busyUserId === user.id;
                    return (
                      <tr key={user.id} className="align-top">
                        <td className="px-4 py-4">
                          <div className="font-medium text-foreground">{user.email}</div>
                          <div className="mt-1 text-xs text-muted-foreground">ID: {user.id?.slice(0, 8)}...</div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone={getBadgeTone("provider", user.provider || "LOCAL")}>{user.provider || "LOCAL"}</Badge>
                        </td>
                        <td className="px-4 py-4 text-foreground">{user.approvalStatus}</td>
                        <td className="px-4 py-4">
                          <select
                            value={selectedRoles[user.id] || "USER"}
                            onChange={(event) =>
                              setSelectedRoles((prev) => ({
                                ...prev,
                                [user.id]: event.target.value,
                              }))
                            }
                            className={inputClasses()}
                          >
                            {availableRoles.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className={buttonClasses("primary")}
                              disabled={isBusy}
                              onClick={() => handleApprove(user.id)}
                            >
                              {isBusy ? "Working..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              className={buttonClasses("danger")}
                              disabled={isBusy}
                              onClick={() => handleReject(user.id)}
                            >
                              {isBusy ? "Working..." : "Reject"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>

        <Panel>
          <SectionHeading
            title="Role guide"
            description="Keep approvals consistent by using the same rule of thumb for similar user requests."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roleDescriptions.map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-border bg-background p-4">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </FullBleedShell>
  );
}
