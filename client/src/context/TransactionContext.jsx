import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEtherumContract = async () => {
    
    console.log(window.ethereum);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    // console.log(transactionContract);
  return transactionContract;
}

export const TransactionProvider = ({ children }) => {
    const [connectedAccount, setConnectedAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);
    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

  const getAllTransactions = async () => { 
    try {
      if (!ethereum) return alert("Please install MetaMask");
            const transactionContract = getEtherumContract();
      
      const availableTransactions = await transactionContract.then(
        (contract) => {
          console.log(contract.getAllTransactions());
          return contract.getAllTransactions();
        },
        (error) => {
          console.log(error);
        }
      );
      const structuredTransactions = availableTransactions.map((transaction) => ({ 
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.keyword,
        keyword: transaction.message,
        amount: parseInt(transaction.amount._hex) / (10 ** 18),
      }));
      console.log(structuredTransactions);
      setTransactions(structuredTransactions);
    }catch (error) { 
      console.log(error);
      throw new Error("No Ethereum object");
    }
  }
  
    const checkIfWalletIsConnected = async () => { 
        try {
    
            if (!ethereum) return alert("Please install MetaMask");
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length) { 
                setConnectedAccount(accounts[0]);
                getAllTransactions();
            } else {
                console.log("No authorized account found");
            }
        } catch (error) { 
              console.log(error);
              throw new Error("No Ethereum object");
        }

// console.log(accounts)
  }
  const checkIfTransactionExist = async () => { 
    try {
            const transactionContract = getEtherumContract();
       const transactionCount = await transactionContract.then(
         (contract) => {
           console.log(contract);
           return contract.getTransactionCount();
         },
         (error) => {
           console.log(error);
         }
      );
      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object");
    }
  }
    const connectWallet = async () => {
        try {
        if (!ethereum) return alert("Please install MetaMask");
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            setConnectedAccount(accounts[0]);
            
        }catch (error) {
            console.log(error);
            throw new Error("No Ethereum object");
        }
     }

    const sendTransaction = async () => { 
        try {
        if (!ethereum) return alert("Please install MetaMask");
             //get data from the form...
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEtherumContract();
            console.log(transactionContract);
            const parsedAmount = ethers.utils.parseEther(amount);
            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: connectedAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEI
                    value: parsedAmount._hex, // .00001
}]
            });
            const transactionHash = await transactionContract.then((contract) => { 
                console.log(contract);
                return contract.addToBlockchain(addressTo, parsedAmount, keyword, message);
            }, (error) => {
                console.log(error);
             }
            )
        //  const transactionHash = await getEtherumContract().addToBlockchain(addressTo, parsedAmount, keyword, message);
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            // const transactionCount = await transactionContract.getTransactionCount();
            const transactionCount = await transactionContract.then(
              (contract) => {
                console.log(contract);
                return contract.getTransactionCount();
              },
              (error) => {
                console.log(error);
              }
            );
          setTransactionCount(transactionCount.toNumber());
          window.reload();
        }catch (error) {
            console.log(error);
            throw new Error("No Ethereum object");
        }
    }
    
    useEffect(() => { 
      checkIfWalletIsConnected();
      checkIfTransactionExist();
    },[])
    return (
      <TransactionContext.Provider
        value={{
          connectWallet,
          connectedAccount,
          formData,
          setFormData,
          handleChange,
          sendTransaction,
          transactions,
          isLoading,
        }}
      >
        {children}
      </TransactionContext.Provider>
    );
  
};