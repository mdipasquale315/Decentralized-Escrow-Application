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

  // Connect wallet on load
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

  // Convert ETH → Wei
  function handleEthChange(e) {
    const eth = e.target.value;
    setEthAmount(eth);

    try {
      const wei = ethers.utils.parseEther(eth || "0").toString();
      setWeiAmount(wei);
    } catch {
      setWeiAmount("");
    }
  }

  // Convert Wei → ETH
  function handleWeiChange(e) {
    const wei = e.target.value;
    setWeiAmount(wei);

    try {
      const eth = ethers.utils.formatEther(wei || "0");
      setEthAmount(eth);
    } catch {
      setEthAmount("");
    }
  }

  // Deploy a new escrow instance
  async function newContract() {
    const arbiter = document.getElementById("arbiter").value.trim();
    const beneficiary = document.getElementById("beneficiary").value.trim();

    if (!ethers.utils.isAddress(arbiter)) {
      setStatus("❌ Invalid arbiter address");
      return;
    }

    if (!ethers.utils.isAddress(beneficiary)) {
      setStatus("❌ Invalid beneficiary address");
      return;
    }

    if (!weiAmount || weiAmount === "0") {
      setStatus("❌ Enter a valid deposit amount");
      return;
    }

    if (!signer) {
      setStatus("❌ Connect your wallet first");
      return;
    }

    setStatus("⏳ Deploying… confirm in your wallet…");

    try {
      const value = ethers.BigNumber.from(weiAmount);

      const escrowContract = await deploy(
        signer,
        arbiter,
        beneficiary,
        value
      );

      const newEscrow = {
        address: escrowContract.address,
        arbiter,
        beneficiary,
        value: ethAmount,
        handleApprove: async () => {
          escrowContract.on("Approved", () => {
            const el = document.getElementById(escrowContract.address);
            if (el) {
              el.className = "complete";
              el.innerText = "✓ It's been approved!";
            }
          });

          setStatus("⏳ Waiting for approval…");
          await approve(escrowContract, signer);
          setStatus("✔ Escrow approved");
        },
      };

      setEscrows((prev) => [...prev, newEscrow]);
      setEthAmount("");
      setWeiAmount("");

      setStatus("✔ Contract deployed successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ " + err.message);
    }
  }

  return (
    <div className="contract">
      <h1>New Escrow Contract</h1>

      <div className="connected-account">
        Connected: {account || "Not connected"}
      </div>

      {status && <div className="status">{status}</div>}

      <label>
        Arbiter Address
        <input type="text" id="arbiter" placeholder="0x..." />
      </label>

      <label>
        Beneficiary Address
        <input type="text" id="beneficiary" placeholder="0x..." />
      </label>

      <label>
        Deposit Amount (ETH)
        <input
          type="text"
          value={ethAmount}
          onChange={handleEthChange}
          placeholder="1.0"
        />
      </label>

      <label>
        Deposit Amount (Wei)
        <input
          type="text"
          value={weiAmount}
          onChange={handleWeiChange}
          placeholder="1000000000000000000"
        />
      </label>

      <div
        className="button"
        id="deploy"
        onClick={(e) => {
          e.preventDefault();
          newContract();
        }}
      >
        Deploy
      </div>

      <div className="existing-contracts">
        <h1>Existing Contracts</h1>
        <div id="container">
          {escrows.map((escrow) => (
            <Escrow key={escrow.address} {...escrow} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
