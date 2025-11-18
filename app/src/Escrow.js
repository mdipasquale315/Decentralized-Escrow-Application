import React from 'react';


export default function Escrow({ address, arbiter, beneficiary, value, handleApprove }) {
return (
<div className="card" id={address}>
<div className="card-row">
<div><strong>Address:</strong> {address}</div>
<div className="value"><strong>Deposit:</strong> {value} ETH</div>
</div>


<div className="card-row">
<div><strong>Arbiter:</strong> {arbiter}</div>
<div><strong>Beneficiary:</strong> {beneficiary}</div>
</div>


<div className="card-actions">
<button className="approve" onClick={handleApprove}>Approve</button>
</div>
</div>
);
}