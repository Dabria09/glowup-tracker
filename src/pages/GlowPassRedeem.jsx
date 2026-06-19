import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, Gift, Check, X, Loader2, Shield } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import BrandLogo from '@/components/BrandLogo';

export default function GlowPassRedeem() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [passData, setPassData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProductSelect, setShowProductSelect] = useState(false);

  useEffect(() => {
    // Check for code in URL params
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
      setCode(urlCode);
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await base44.entities.GlowProduct.filter({ is_active: true });
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const validatePass = async () => {
    if (!code.trim()) {
      setError('Please enter a Glow Pass code');
      return;
    }

    setValidating(true);
    setError('');
    setPassData(null);

    try {
      const passes = await base44.entities.JoinCode.filter({ 
        code: code.trim(),
        code_type: 'promo'
      });

      if (!passes || passes.length === 0) {
        setError('Invalid Glow Pass code. Please check and try again.');
        setValidating(false);
        return;
      }

      const pass = passes[0];

      // Check active status
      if (!pass.is_active) {
        setError('This Glow Pass has been disabled.');
        setValidating(false);
        return;
      }

      // Check expiration
      if (pass.valid_until && new Date(pass.valid_until) < new Date()) {
        setError('This Glow Pass has expired.');
        setValidating(false);
        return;
      }

      // Check usage limit
      if (pass.max_uses > 0 && pass.current_uses >= pass.max_uses) {
        setError('This Glow Pass has reached its usage limit.');
        setValidating(false);
        return;
      }

      setPassData(pass);
      setShowProductSelect(true);
    } catch (err) {
      setError('Failed to validate pass. Please try again.');
      console.error('Validation error:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedProduct) {
      setError('Please select a product to redeem this pass for.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('createCheckout', {
        passCode: code.trim(),
        productId: selectedProduct.id,
        quantity: 1
      });

      if (response.data.success && response.data.checkoutUrl) {
        // Redirect to Base44 Payments checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        setError(response.data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Failed to process redemption. Please try again.');
      console.error('Redemption error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (pass) => {
    if (!pass.discount_value) return 'No discount';
    if (pass.discount_type === 'percentage') {
      return `${pass.discount_value}% OFF`;
    }
    return `$${pass.discount_value} OFF`;
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(135deg, #0d0608 0%, #1a0a18 100%)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <BrandLogo size="sm" />
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">
            Cancel
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
            style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.3)' }}>
            <Gift size={32} className="text-pink-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
            Redeem Your Glow Pass
          </h1>
          <p className="text-sm text-gray-400">
            Enter your promo code to unlock exclusive discounts
          </p>
        </div>

        {/* Code Input */}
        {!showProductSelect && (
          <div className="rounded-2xl p-6 mb-6" 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Glow Pass Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., PROMO50)"
                className="w-full text-white text-center text-lg font-bold rounded-xl p-4 tracking-wider"
                style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  textTransform: 'uppercase'
                }}
                disabled={validating}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl flex items-start gap-2" 
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <X size={16} className="text-red-400 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={validatePass}
              disabled={validating || !code.trim()}
              className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
              style={{ 
                background: validating ? '#555' : 'linear-gradient(135deg, #ec4899, #a855f7)',
                opacity: validating || !code.trim() ? 0.7 : 1
              }}>
              {validating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Validate Code
                </>
              )}
            </button>
          </div>
        )}

        {/* Pass Details & Product Selection */}
        {showProductSelect && passData && (
          <div className="space-y-4">
            {/* Pass Info Card */}
            <div className="rounded-2xl p-4" 
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Check size={16} className="text-green-400" />
                <p className="text-sm font-bold text-green-300">Valid Glow Pass</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Discount</p>
                  <p className="text-lg font-bold text-white">{formatDiscount(passData)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Uses</p>
                  <p className="text-sm font-bold text-white">
                    {passData.current_uses || 0} / {passData.max_uses || '∞'}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <p className="text-xs text-gray-400 mb-3">Select a product to apply your discount:</p>
              <div className="space-y-3">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full p-4 rounded-xl text-left transition ${
                      selectedProduct?.id === product.id 
                        ? 'border-pink-500' 
                        : 'border-white/10'
                    }`}
                    style={{ 
                      background: selectedProduct?.id === product.id 
                        ? 'rgba(236,72,153,0.1)' 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedProduct?.id === product.id ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.1)'}`
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{product.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">${product.price}</p>
                        {selectedProduct?.id === product.id && (
                          <Check size={16} className="text-pink-400 ml-2 inline" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleRedeem}
                disabled={loading || !selectedProduct}
                className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{ 
                  background: loading || !selectedProduct ? '#555' : 'linear-gradient(135deg, #ec4899, #a855f7)',
                  opacity: loading || !selectedProduct ? 0.7 : 1
                }}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Continue to Secure Checkout
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowProductSelect(false);
                  setPassData(null);
                  setSelectedProduct(null);
                }}
                className="w-full py-3 rounded-xl font-bold text-gray-400 text-sm hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                Use Different Code
              </button>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Shield size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Secure checkout powered by Base44 Payments</span>
          </div>
        </div>
      </div>

      <BottomNav active="glow" />
    </div>
  );
}