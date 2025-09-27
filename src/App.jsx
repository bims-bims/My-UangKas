import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Wallet,
  BanknoteArrowUp,
  Send,
  Download,
  University,
  Loader2,
} from "lucide-react";

// ABI kontrak
const contractABI = [
  {
    inputs: [{ internalType: "address payable", name: "penerima", type: "address" }],
    name: "bayar",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { inputs: [], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "jumlah", type: "uint256" }],
    name: "tarik",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [],
    name: "getSaldo",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

const contractAddress = "0xe51fA25a4b891edc52275524A689063230145E9B"; // ganti dengan address kontrakmu

function App() {
  const [account, setAccount] = useState(null);
  const [saldo, setSaldo] = useState("0");
  const [jumlahDeposit, setJumlahDeposit] = useState("");
  const [jumlahBayar, setJumlahBayar] = useState("");
  const [jumlahTarik, setJumlahTarik] = useState("");
  const [penerima, setPenerima] = useState("");
  const [contract, setContract] = useState(null);

  // loading state
  const [depositLoading, setDepositLoading] = useState(false);
  const [bayarLoading, setBayarLoading] = useState(false);
  const [tarikLoading, setTarikLoading] = useState(false);

  // connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask dulu");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const instance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(instance);

      const s = await instance.getSaldo();
      setSaldo(ethers.formatEther(s));
    } catch (err) {
      console.error(err);
      alert("Gagal connect wallet");
    }
  };

  const loadSaldo = async () => {
    if (!contract) return;
    try {
      const s = await contract.getSaldo();
      setSaldo(ethers.formatEther(s));
    } catch (err) {
      console.error(err);
    }
  };

  const isValidAmount = (val) => val && !isNaN(val) && Number(val) > 0;

  // deposit
  const deposit = async () => {
    if (!isValidAmount(jumlahDeposit)) return alert("Masukkan jumlah deposit yang valid (> 0)");
    try {
      setDepositLoading(true);
      const tx = await contract.deposit({ value: ethers.parseEther(jumlahDeposit) });
      await tx.wait();
      setJumlahDeposit("");
      loadSaldo();
      alert("Deposit berhasil!");
    } catch (err) {
      console.error(err);
      alert("Gagal deposit!");
    } finally {
      setDepositLoading(false);
    }
  };

  // bayar
  const bayar = async () => {
    if (!ethers.isAddress(penerima)) return alert("Alamat penerima tidak valid!");
    if (!isValidAmount(jumlahBayar)) return alert("Jumlah tidak valid (> 0)");
    try {
      setBayarLoading(true);
      const tx = await contract.bayar(penerima, { value: ethers.parseEther(jumlahBayar) });
      await tx.wait();
      setJumlahBayar("");
      setPenerima("");
      alert("Pembayaran berhasil!");
    } catch (err) {
      console.error(err);
      alert("Gagal membayar!");
    } finally {
      setBayarLoading(false);
    }
  };

  // tarik
  const tarik = async () => {
    if (!isValidAmount(jumlahTarik)) return alert("Jumlah tidak valid (> 0)");
    try {
      setTarikLoading(true);
      const tx = await contract.tarik(ethers.parseEther(jumlahTarik));
      await tx.wait();
      setJumlahTarik("");
      loadSaldo();
      alert("Penarikan berhasil!");
    } catch (err) {
      console.error(err);
      alert("Gagal tarik saldo Anda Bukan Wali Kelas!");
    } finally {
      setTarikLoading(false);
    }
  };

  useEffect(() => {
    if (account && contract) loadSaldo();
  }, [account, contract]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2 text-indigo-700">
          <University size={28} /> Dapps Uang Kas Sekolah
        </h2>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Wallet size={20} /> Connect Wallet
          </button>
        ) : (
          <p className="text-sm text-gray-700 mb-4 break-all">
            Wallet: <span className="font-mono">{account}</span>
          </p>
        )}

        <div className="bg-gray-50 border rounded-lg p-3 mb-6 text-center">
          <p className="text-gray-600">Saldo Uang Kas:</p>
          <p className="text-2xl font-bold text-indigo-700">{saldo} ETH</p>
        </div>

        {/* Deposit */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2 text-green-700 flex items-center gap-2">
            <BanknoteArrowUp size={20} /> Bayar Uang Kas Sekolah
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Jumlah ETH"
              value={jumlahDeposit}
              onChange={(e) => setJumlahDeposit(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={deposit}
              disabled={depositLoading}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-1 transition ${
                depositLoading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {depositLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Proses...
                </>
              ) : (
                <>
                  <BanknoteArrowUp size={16} /> Deposit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bayar */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2 text-blue-700 flex items-center gap-2">
            <Send size={20} /> Bayar Uang Sekolah
          </h3>
          <input
            type="text"
            placeholder="Alamat penerima"
            value={penerima}
            onChange={(e) => setPenerima(e.target.value)}
            className="w-full mb-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Jumlah ETH"
              value={jumlahBayar}
              onChange={(e) => setJumlahBayar(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={bayar}
              disabled={bayarLoading}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-1 transition ${
                bayarLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {bayarLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Proses...
                </>
              ) : (
                <>
                  <Send size={16} /> Bayar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tarik */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-red-700 flex items-center gap-2">
            <Download size={20} /> Tarik saldo (Owner)
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Jumlah ETH"
              value={jumlahTarik}
              onChange={(e) => setJumlahTarik(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
            />
            <button
              onClick={tarik}
              disabled={tarikLoading}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-1 transition ${
                tarikLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {tarikLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Proses...
                </>
              ) : (
                <>
                  <Download size={16} /> Tarik
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
