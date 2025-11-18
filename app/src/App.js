import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import deploy from './deploy';
import Escrow from './Escrow';
import './App.css';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [ethAmount, setEthAmount] = useState('');
  const [weiAmount, setWeiAmount] = useState('');
  const [status, setStatus] = useState('');
  const [gasEstimate, setGasEstimate] = useState(null);

  useEffect(() => {
    async function getAccounts() {
      try {
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
        setSigner(provider.getSigner());
      } catch (err) {
        console.error('User denied account access', err);
      }
    }
    getAccounts();
  }, []);

  // Convert ETH -> WEI safely
  function handleEthChange(e) {
    const eth = e.target.value;
    setEthAmount(eth);
    try {
      const wei = ethers.utils.parseEther(eth || '0').toString();
      setWeiAmount(wei);
      estimateGasForValue(wei);
    } catch (err) {
      setWeiAmount('');
      setGasEstimate(null);
    }
  }

  // Convert WEI -> ETH safely
  function handleWeiChange(e) {
    const wei = e.target.value;
    setWeiAmount(wei);
    try {
      const eth = ethers.utils.formatEther(wei || '0');
      setEthAmount(eth);
      estimateGasForValue(wei);
    } catch (err) {
      setEthAmount('');
      setGasEstimate(null);
    }
  }

  async function estimateGasForValue(value) {
    try {
      // Estimate gas for a typical escrow deployment
      const estimate = await provider.estimateGas({
        value: value || '0'
      });
      setGasEstimate(estimate);
    } catch (err) {
      setGasEstimate(null);
    }
  }

  async function newContract() {
    try {
      setStatus('Deploying...');
      const beneficiary = document.getElementById('beneficiary').value;
      const arbiter = document.getElementById('arbiter').value;
      const value = weiAmount || ethers.utils.parseEther(ethAmount || '0').toString();

      const escrowContract = await deploy(signer, arbiter, beneficiary, value);

      const escrow = {
        address: escrowContract.address,
        arbiter,
        beneficiary,
        value: value,
        handleApprove: async () => {
          escrowContract.on('Approved', () => {
            document.getElementById(escrowContract.address).className = 'complete';
            document.getElementById(escrowContract.address).innerText = "✓ It's been approved!";
          });

          await approve(escrowContract, signer);
        },
      };

      setEscrows([...escrows, escrow]);
      setStatus('Deployed successfully!');
      setEthAmount('');
      setWeiAmount('');
      setGasEstimate(null);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className="contract">
      <h1>New Contract</h1>
      
      {status && <div className="status">{status}</div>}
      
      <label>
        Arbiter Address
        <input type="text" id="arbiter" />
      </label>

      <label>
        Beneficiary Address
        <input type="text" id="beneficiary" />
      </label>

      <label>
        Deposit Amount (ETH)
        <input
          type="text"
          id="eth"
          value={ethAmount}
          onChange={handleEthChange}
          placeholder="1.0"
        />
      </label>

      <label>
        Deposit Amount (Wei)
        <input
          type="text"
          id="wei"
          value={weiAmount}
          onChange={handleWeiChange}
          placeholder="1000000000000000000"
        />
      </label>

      {gasEstimate && (
        <div className="gas-estimate">
          Estimated Gas: {gasEstimate.toString()}
        </div>
      )}

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
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
