import { parseUnits } from "ethers";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Define initial supply for the token (e.g., 1 million tokens)
    const initialSupply = parseUnits("1000000", 18); // 1,000,000 tokens with 18 decimals

    // Get the contract factory and deploy the contract
    const Token = await ethers.getContractFactory("ERC20Token");
    const token = await Token.deploy(initialSupply);

    const tokenInstance = await token.Deploy();

    console.log("Token deployed to:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

 