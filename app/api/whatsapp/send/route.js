import { NextResponse } from 'next/server';

// Multi-language WhatsApp message templates
const WA_TEMPLATES = {
  hi: (name, amount, url) =>
    `Namaste ${name}! 🙏\n\nRazorpay RevGuard AI se reminder hai. Aapka ₹${amount} ka payment retry fail ho gaya tha.\n\nAap niche 1-click link se instant pay kar sakte hain:\n${url}\n\n-- Razorpay Automated Recovery`,
  en: (name, amount, url) =>
    `Hello ${name}! 🙏\n\nThis is a reminder from Razorpay RevGuard AI. Your payment of ₹${amount} could not be processed.\n\nYou can pay instantly via this 1-click link:\n${url}\n\n-- Razorpay Automated Recovery`,
  ta: (name, amount, url) =>
    `வணக்கம் ${name}! 🙏\n\nRazorpay RevGuard AI நினைவூட்டல். உங்கள் ₹${amount} கட்டணம் செயலாக்கப்படவில்லை.\n\nஇந்த லிங்க் மூலம் உடனடியாக பணம் செலுத்துங்கள்:\n${url}\n\n-- Razorpay Automated Recovery`,
  te: (name, amount, url) =>
    `నమస్కారం ${name}! 🙏\n\nRazorpay RevGuard AI రిమైండర్. మీ ₹${amount} చెల్లింపు ప్రాసెస్ కాలేదు.\n\nఈ లింక్ ద్వారా వెంటనే చెల్లించండి:\n${url}\n\n-- Razorpay Automated Recovery`,
  kn: (name, amount, url) =>
    `ನಮಸ್ಕಾರ ${name}! 🙏\n\nRazorpay RevGuard AI ರಿಮೈಂಡರ್. ನಿಮ್ಮ ₹${amount} ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಗೊಳ್ಳಲಿಲ್ಲ.\n\nಈ ಲಿಂಕ್ ಮೂಲಕ ತಕ್ಷಣ ಪಾವತಿಸಿ:\n${url}\n\n-- Razorpay Automated Recovery`,
  mr: (name, amount, url) =>
    `नमस्कार ${name}! 🙏\n\nRazorpay RevGuard AI कडून रिमाइंडर. तुमचे ₹${amount} पेमेंट प्रोसेस होऊ शकले नाही.\n\nया लिंकवरून लगेच पेमेंट करा:\n${url}\n\n-- Razorpay Automated Recovery`,
  bn: (name, amount, url) =>
    `নমস্কার ${name}! 🙏\n\nRazorpay RevGuard AI থেকে রিমাইন্ডার। আপনার ₹${amount} পেমেন্ট প্রসেস হয়নি।\n\nএই লিংক থেকে এখনই পেমেন্ট করুন:\n${url}\n\n-- Razorpay Automated Recovery`,
  gu: (name, amount, url) =>
    `નમસ્તે ${name}! 🙏\n\nRazorpay RevGuard AI તરફથી રિમાઇન્ડર. તમારું ₹${amount} પેમેન્ટ પ્રોસેસ થયું નથી.\n\nઆ લિંક પરથી તરત જ પેમેન્ટ કરો:\n${url}\n\n-- Razorpay Automated Recovery`,
  ml: (name, amount, url) =>
    `നമസ്കാരം ${name}! 🙏\n\nRazorpay RevGuard AI ഓർമ്മപ്പെടുത്തൽ. നിങ്ങളുടെ ₹${amount} പേയ്‌മെന്റ് പ്രോസസ്സ് ചെയ്യാനായില്ല.\n\nഈ ലിങ്ക് വഴി ഉടൻ പേയ്‌മെന്റ് ചെയ്യുക:\n${url}\n\n-- Razorpay Automated Recovery`,
  pa: (name, amount, url) =>
    `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${name}! 🙏\n\nRazorpay RevGuard AI ਤੋਂ ਰਿਮਾਈਂਡਰ। ਤੁਹਾਡਾ ₹${amount} ਪੇਮੈਂਟ ਪ੍ਰੋਸੈੱਸ ਨਹੀਂ ਹੋਇਆ।\n\nਇਸ ਲਿੰਕ ਤੋਂ ਤੁਰੰਤ ਪੇਮੈਂਟ ਕਰੋ:\n${url}\n\n-- Razorpay Automated Recovery`,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { toPhoneNumber, customerName, amount, paymentUrl, language = 'hi', accountSid, authToken, fromWhatsAppNumber } = body;

    const rawSid = accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    const rawToken = authToken || process.env.TWILIO_AUTH_TOKEN || '';
    const activeSid = rawSid.replace(/"/g, '').trim();
    const activeToken = rawToken.replace(/"/g, '').trim();
    const activeFrom = (fromWhatsAppNumber || process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+17372508034').replace(/"/g, '').trim();

    if (!toPhoneNumber) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    // Format phone number for Twilio WhatsApp (must start with whatsapp:+...)
    let formattedTo = toPhoneNumber.trim();
    if (!formattedTo.startsWith('whatsapp:')) {
      if (!formattedTo.startsWith('+')) {
        formattedTo = `+91${formattedTo}`; // Default to India country code if omitted
      }
      formattedTo = `whatsapp:${formattedTo}`;
    }

    const numAmount = Number(amount) || 2499;
    const url = paymentUrl || 'https://razorpay.com';

    // Use language-specific template
    const templateFn = WA_TEMPLATES[language] || WA_TEMPLATES.hi;
    const messageBody = templateFn(customerName || 'Valued Customer', numAmount.toLocaleString('en-IN'), url);

    const authHeader = 'Basic ' + Buffer.from(`${activeSid}:${activeToken}`).toString('base64');

    // Attempt Twilio API call if credentials present
    if (activeSid && activeToken && activeSid.startsWith('AC')) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${activeSid}/Messages.json`;

        const params = new URLSearchParams();
        params.append('From', activeFrom);
        params.append('To', formattedTo);
        params.append('Body', messageBody);

        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader,
          },
          body: params.toString(),
        });

        const twilioData = await twilioRes.json();

        if (twilioRes.ok) {
          return NextResponse.json({
            success: true,
            isRealSent: true,
            sid: twilioData.sid,
            status: twilioData.status,
            to: formattedTo,
            language,
            message: `Real WhatsApp message sent in ${language.toUpperCase()} to ${formattedTo} via Twilio API!`,
          });
        } else {
          console.warn('Twilio API returned info:', twilioData);
          const cleanPhone = formattedTo.replace('whatsapp:', '').replace('+', '');
          const encodedMsg = encodeURIComponent(messageBody);
          const waLink = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
          return NextResponse.json({
            success: true,
            isRealSent: false,
            to: formattedTo,
            language,
            previewMessage: messageBody,
            waLink,
            message: `WhatsApp ready! Click the 1-tap link to send on WhatsApp: ${waLink}`,
          });
        }
      } catch (err) {
        console.warn('Twilio fetch failed:', err.message);
      }
    }

    // High-fidelity fallback response when Twilio credentials are mock
    return NextResponse.json({
      success: true,
      isRealSent: false,
      to: formattedTo,
      language,
      previewMessage: messageBody,
      message: `Simulated WhatsApp in ${language.toUpperCase()} to ${formattedTo}. (Add TWILIO_ACCOUNT_SID to .env.local for real delivery).`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'WhatsApp sending failed' },
      { status: 500 }
    );
  }
}
