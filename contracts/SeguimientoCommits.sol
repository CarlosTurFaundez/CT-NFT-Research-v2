// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SeguimientoCommits {
    struct InfoCommit {
        string hash;
        string autor;
        uint256 timestamp;
    }

    InfoCommit[] public commits;

    function agregarCommit(string memory _hash, string memory _autor) public {
        commits.push(InfoCommit(_hash, _autor, block.timestamp));
    }

    // Función para obtener todos los commits
    function obtenerCommits() public view returns (InfoCommit[] memory) {
        return commits;
    }
}