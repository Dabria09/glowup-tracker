import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Check, Sparkles, Gift, ArrowRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import BrandLogo from '@/components/BrandLogo';

export default function GlowPassSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passCode, setPassCode] = useState('');
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('passCode');
    const productId = searchParams.get('productId');
    
    if (code) {
      setPassCode(code);
    }
    
    if (productId) {
      loadProduct(productId);
    }
    
    setLoading(false);
  }, [searchParams]);

  const loadProduct = async (productId) => {
    try {
      const products = await base44.entities.GlowProduct.filter({ id: productId });
      if (products && products.length > 0) {
        setProductName(products[0].name);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
        style={{ background: 'linear-gradient(135deg, #0d0608 0%, #1a0a18 100%)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin" 
            style={{ border: '3px solid rgba(236,72,153,0.2)', borderTopColor: '#ec4899' }} />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(135deg, #0d0608 0%, #1a0a18 100%)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <BrandLogo size="sm" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" 
            style={{ background: 'rgba(16,185,129,0.2)', border: '2px solid rgba(16,185,129,0.3)' }}>
            <Check size={40} className="text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
            Payment Successful!
          </h1>
          <p className="text-sm text-gray-400">
            Your Glow Pass has been redeemed
          </p>
        </div>

        {/* Details Card */}
        <div className="rounded-2xl p-6 mb-6" 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ background: 'rgba(236,72,153,0.2)' }}>
                <Gift size={20} className="text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Promo Code</p>
                <p className="text-sm font-bold text-white">{passCode || 'N/A'}</p>
              </div>
            </div>

            {productName && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ background: 'rgba(168,85,247,0.2)' }}>
                  <Sparkles size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Product</p>
                  <p className="text-sm font-bold text-white">{productName}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2">What's Next?</p>
              <p className="text-sm text-gray-300">
                Your discount has been applied and your order is being processed. 
                You'll receive a confirmation email shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          Continue to Dashboard
          <ArrowRight size={16} />
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Questions? Contact support at <a href="/support" className="text-pink-400 hover:underline">support@ggu.com</a>
          </p>
        </div>
      </div>

      <BottomNav active="glow" />
    </div>
  );
}