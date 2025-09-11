const Navbar = ({ balance }: { balance: number }) => {
  return (
    <div>
      <div className="py-5 flex items-center justify-between px-8">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <p className="text-3xl font-bold">
            xness
          </p>
        </div>

        <div className="font-semibold text-xl bg-neutral-400 rounded-md py-2 px-3">
          {balance.toFixed(2)}
        </div>
      </div>
      <div className="px-10">
        <div className="w-full h-0.5 bg-neutral-400"></div>
      </div>
    </div>
  )
}

export default Navbar