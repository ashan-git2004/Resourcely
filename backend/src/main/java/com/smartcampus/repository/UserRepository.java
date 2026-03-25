package com.smartcampus.repository;

import com.smartcampus.model.ApprovalStatus;
import com.smartcampus.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);
}
