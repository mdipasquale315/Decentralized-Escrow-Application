import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import deploy from "./deploy";
import Escrow from "./Escrow";
import "./App.css";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);

  const [ethAmount, setEthAmount] = useState("");
  const [weiAmount, setWeiAmount] = useState("");
  const [status, setStatus] = useState("");

  // 🔹 Connect wallet on load
  useEffect(() => {
    async function connect() {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setSigner(provider.getSigner());
      } catch (err) {
        console.error("Wallet connection denied", err);
      }
    }
    connect();
  }, []);

  // 🔹 Convert ETH → WEI
  function handleEthChange(e) {
    const eth = e.target.v
