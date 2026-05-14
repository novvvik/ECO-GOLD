# Security Specification - EcoGold

## 1. Data Invariants
- A `user` profile must be created by the owner precisely once and contain a valid role of 'nasabah'.
- `balance` and `goldBalance` can only be updated via the owner (for logic) or admin/petugas.
- A `transaction` must have a `userId` matching the creator.
- `transaction` `status` is immutable once 'completed', except by admin.
- `wasteTypes` are read-only for users, modifiable only by admins.

## 2. The "Dirty Dozen" Payloads

1. **Identity Theft (Profile)**: Attempt to create a user profile with a different UID.
   ```json
   { "userId": "victim_uid", "role": "admin", "balance": 1000000 }
   ```
2. **Identity Theft (Transaction)**: Attempt to create a transaction for another user.
   ```json
   { "userId": "victim_uid", "type": "deposit", "amount": 50000 }
   ```
3. **Privilege Escalation**: A 'nasabah' trying to set their role to 'admin'.
   ```json
   { "role": "admin" }
   ```
4. **Balance Inject**: Update balance directly without a transaction.
   ```json
   { "balance": 9999999 }
   ```
5. **Ghost Fields**: Adding `isVerified: true` to a user profile.
   ```json
   { "displayName": "Attacker", "isVerified": true }
   ```
6. **Negative Balance**: Setting balance to a negative number.
   ```json
   { "balance": -100 }
   ```
7. **Invalid ID Poisoning**: Creating a transaction with a 2KB ID string.
8. **Malicious Waste Type**: A user trying to create a `wasteType` with price 1,000,000.
   ```json
   { "name": "Plastic", "pricePerKg": 1000000 }
   ```
9. **Status Flipping**: A user trying to revert a 'completed' transaction to 'pending'.
10. **Admin Spoofing**: Attempt to access `/stats/global` without admin role.
11. **PII Leak**: An unauthenticated user trying to list all users.
12. **Orphaned Transaction**: Creating a transaction with a non-existent `userId`.

## 3. The Test Runner
(I will implement `firestore.rules.test.ts` if requested, but for now I'll focus on hardening the rules based on these payloads).
