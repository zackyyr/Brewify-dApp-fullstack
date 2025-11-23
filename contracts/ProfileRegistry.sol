// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProfileRegistry {
    enum Role {
        Unknown,
        Buyer,
        Farmer
    }

    struct Profile {
        string displayName;  // nama yang ditampilkan di UI
        string avatarUri;    // optional: URI/IPFS untuk avatar/foto
        Role   role;         // Buyer / Farmer (sesuai pilihan user di awal)
    }

    mapping(address => Profile) private profiles;

    event ProfileUpdated(
        address indexed user,
        string  displayName,
        string  avatarUri,
        Role    role
    );

    /// User mengatur / meng-update profil sendiri (tanpa database terpusat)
    function setProfile(
        string calldata displayName,
        string calldata avatarUri,
        Role   role
    ) external {
        profiles[msg.sender] = Profile({
            displayName: displayName,
            avatarUri:   avatarUri,
            role:        role
        });

        emit ProfileUpdated(msg.sender, displayName, avatarUri, role);
    }

    function getProfile(address user)
        external
        view
        returns (string memory displayName, string memory avatarUri, Role role)
    {
        Profile storage p = profiles[user];
        return (p.displayName, p.avatarUri, p.role);
    }
}
