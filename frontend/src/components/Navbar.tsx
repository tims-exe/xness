/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react"

const Navbar = () => {
  const [balance, setBalance] = useState(0);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const userId = 1;

  useEffect(() => {
    const fetchBalance = async () => {
      const response = await axios.get(`${BACKEND_URL}/api/get-balance/${userId}`)
      setBalance(response.data.balance)
    }

    fetchBalance()
  }, [])

  return (
    <div>
      <div className="py-5 flex items-center justify-between px-8">
        <p className="text-3xl font-bold">
          xness
        </p>
        <div className="font-semibold text-xl bg-neutral-400 rounded-md py-2 px-3">
          {balance}
        </div>
      </div>
      <div className="px-10">
        <div className="w-full h-0.5 bg-neutral-400"></div>
      </div>
    </div>
  )
}

export default Navbar