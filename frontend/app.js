window.onload = async () => {
    // Check if Web3 (MetaMask) is available
    if (typeof window.ethereum === 'undefined') {
        alert("Please install MetaMask or another Ethereum-compatible browser extension.");
        return;
    }

    try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // Request account access

        // Set the contract address and ABI (replace with your actual contract ABI)
        const contractAddress = "0x70B1053B873028ed1Bd3411A4e0d43ED6E276B78"; // Replace with your contract address
        const contractABI = [
            // Your contract ABI here (as provided in your original code)
        ];

        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Get the user's accounts (MetaMask)
        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0]; // Use the first account

        // DOM elements
        const nftPriceElement = document.getElementById("nftPrice");
        const contractBalanceElement = document.getElementById("contractBalance");
        const tokenURIInput = document.getElementById("tokenURI");
        const mintNFTButton = document.getElementById("mintNFTButton");
        const contributionMessage = document.getElementById("contributionMessage");
        const withdrawFundsButton = document.getElementById("withdrawFundsButton");
        const newPriceInput = document.getElementById("newPrice");
        const setPriceButton = document.getElementById("setPriceButton");
        const connectWalletButton = document.getElementById("connectWalletButton");

        // Function to fetch and display contract data
        const fetchData = async () => {
            try {
                // Fetch current NFT price from the contract
                const pricePerNFT = await contract.methods.pricePerNFT().call();
                nftPriceElement.textContent = web3.utils.fromWei(pricePerNFT, 'ether'); // Display price in ETH

                // Fetch the contract's balance
                const contractBalance = await web3.eth.getBalance(contractAddress);
                contractBalanceElement.textContent = web3.utils.fromWei(contractBalance, 'ether'); // Display contract balance in ETH
            } catch (error) {
                console.error("Error fetching contract data:", error);
                alert("Failed to fetch contract data. Please try again.");
            }
        };

        // Connect Wallet Button
        connectWalletButton.onclick = async () => {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                alert("Wallet connected successfully!");
                await fetchData(); // Refresh contract data
            } catch (error) {
                console.error("Error connecting wallet:", error);
                alert("Failed to connect wallet. Please try again.");
            }
        };

        // Mint NFT Button
        mintNFTButton.onclick = async () => {
            const tokenURI = tokenURIInput.value.trim();
            if (!tokenURI) {
                alert("Please enter a valid Token URI.");
                return;
            }

            try {
                const pricePerNFT = await contract.methods.pricePerNFT().call();
                await contract.methods.mintNFT(tokenURI).send({
                    from: userAddress,
                    value: pricePerNFT, // Send Ether to mint NFT
                });
                contributionMessage.textContent = "Successfully minted NFT!";
                contributionMessage.style.color = "green";
                await fetchData(); // Refresh contract data
            } catch (error) {
                console.error("Error minting NFT:", error);
                contributionMessage.textContent = "Failed to mint NFT. Please try again.";
                contributionMessage.style.color = "red";
            }
        };

        // Withdraw Funds Button (Admin Only)
        withdrawFundsButton.onclick = async () => {
            try {
                // Check if the user is the admin
                const admin = await contract.methods.admin().call();
                if (userAddress.toLowerCase() !== admin.toLowerCase()) {
                    alert("Only the admin can withdraw funds.");
                    return;
                }

                await contract.methods.withdrawFunds().send({ from: userAddress });
                alert("Funds successfully withdrawn!");
                await fetchData(); // Refresh contract data
            } catch (error) {
                console.error("Error withdrawing funds:", error);
                alert("Failed to withdraw funds. Please try again.");
            }
        };

        // Set Price Button (Admin Only)
        setPriceButton.onclick = async () => {
            const newPrice = newPriceInput.value.trim();
            if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
                alert("Please enter a valid price.");
                return;
            }

            try {
                // Check if the user is the admin
                const admin = await contract.methods.admin().call();
                if (userAddress.toLowerCase() !== admin.toLowerCase()) {
                    alert("Only the admin can set the price.");
                    return;
                }

                await contract.methods.setPrice(web3.utils.toWei(newPrice, 'ether')).send({ from: userAddress });
                alert("Price updated successfully!");
                await fetchData(); // Refresh contract data
            } catch (error) {
                console.error("Error setting price:", error);
                alert("Failed to set price. Please try again.");
            }
        };

        // Initialize the app by fetching contract data
        await fetchData();
    } catch (error) {
        console.error("Error initializing app:", error);
        alert("Failed to initialize the app. Please refresh the page and ensure MetaMask is connected.");
    }
};