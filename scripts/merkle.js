const fs = require('fs');
const csv = require('csv-parser');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const ethers = require('ethers');

const airdropData = [];

// Read CSV file
fs.createReadStream('airdrop.csv')
  .pipe(csv())
  .on('data', (row) => {
    const index = parseInt(row.index);
    const address = row.address;
    const amount = parseInt(row.amount);
    
    airdropData.push({ index, address, amount });
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    createMerkleTree(airdropData);
  });

function createMerkleTree(data) {
  // Create the leaves by hashing the index, address, and amount using keccak256
  const leaves = data.map(item => keccak256(ethers.utils.solidityPack(['uint256', 'address', 'uint256'], [item.index, item.address, item.amount])));
  
  // Generate the Merkle tree
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  // Get the Merkle root
  const merkleRoot = merkleTree.getHexRoot();
  console.log('Merkle Root:', merkleRoot);

  // Generate the proof for each address
  const airdropWithProofs = data.map((item, index) => {
    const proof = merkleTree.getHexProof(leaves[index]);
    return {
      index: item.index,
      address: item.address,
      amount: item.amount,
      proof
    };
  });

  // Save the Merkle tree data (proofs for each user) to a JSON file
  fs.writeFileSync('airdrop_with_proofs.json', JSON.stringify(airdropWithProofs, null, 2));
  console.log('Merkle tree and proofs saved to airdrop_with_proofs.json');
}
