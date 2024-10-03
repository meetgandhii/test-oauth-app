import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBalance, transferCrypto, handleLogout } from '../utils/geminiApi';

function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getBalance = async () => {
      console.log("entered get balance")
      try {
        const balanceData = await fetchBalance();
        console.log(balanceData);
        setBalance(balanceData);
      } catch (error) {
        console.error('Error fetching balance:', error);
        navigate('/');
      }
    };

    getBalance();
  }, [navigate]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await transferCrypto(transferCurrency, transferAmount, transferAddress);
      alert('Transfer successful!');
      const updatedBalance = await fetchBalance();
      setBalance(updatedBalance);
    } catch (error) {
      console.error('Error transferring crypto:', error);
      alert('Transfer failed. Please try again.');
    }
  };

  const logout = async () => {
    await handleLogout(navigate);
  };

  if (!balance) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>{balance.lenght > 0 ? (
        <>
        </>
      ) : (
        <>
          <h2>Your Balances:</h2>

          <ul>
            {balance.map((item) => (
              <li key={item.currency}>
                {item.currency}: {item.amount} (Available: {item.available})
              </li>
            ))}
          </ul>
        </>
      )}


      <h2>Transfer Crypto</h2>
      <form onSubmit={handleTransfer}>
        <input
          type="text"
          placeholder="Currency (e.g., BTC)"
          value={transferCurrency}
          onChange={(e) => setTransferCurrency(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Destination Address"
          value={transferAddress}
          onChange={(e) => setTransferAddress(e.target.value)}
          required
        />
        <button type="submit">Transfer</button>
      </form>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;

