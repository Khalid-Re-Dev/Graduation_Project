import { Link } from "react-router-dom"

// Hero section with promotional banner
function HeroSection() {
  return (
    <section className="bg-gray-700 text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Limited Time Discount 40%</h1>
        <p className="text-2xl mb-6">$385.00</p>
        <div className="flex justify-center gap-4">
          {/* <Link
            to="/products"
            className="inline-block bg-white text-[#005580] font-medium py-2 px-6 rounded hover:bg-gray-100 transition-colors"
          >
            Buy Now
          </Link>
          <Link
            to="/compare"
            className="inline-block bg-[#005580] text-white font-medium py-2 px-6 rounded border border-white hover:bg-[#004466] transition-colors"
          >
            Compare Smartly
          </Link> */}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
