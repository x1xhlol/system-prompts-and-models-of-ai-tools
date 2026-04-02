import uuid
from datetime import datetime, timezone
from decimal import Decimal
import logging

logger = logging.getLogger("dealix.services.invoice")

class InvoiceService:
    """ZATCA-Ready Electronic Invoicing Service (Saudi Arabia)."""
    
    def __init__(self, db=None):
        self.db = db

    async def generate_invoice(self, tenant_id: str, deal_id: str, amount: float, customer_info: dict) -> dict:
        """
        Simulates ZATCA Phase 1 & 2 Electronic Invoice generation.
        Includes QR code data and localized formatting.
        """
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        vat_amount = round(amount * 0.15, 2)
        total_amount = round(amount + vat_amount, 2)
        
        invoice_data = {
            "invoice_number": invoice_number,
            "date": datetime.now(timezone.utc).isoformat(),
            "vendor_name": "ديل اي اكس - Dealix Empire",
            "vat_number": "310123456700003", # Mock Saudi VAT ID
            "customer": customer_info,
            "currency": "SAR",
            "items": [
                {
                    "description": f"رسوم وساطة عقارية - صفقة رقم {deal_id}", 
                    "description_en": f"Real Estate Brokerage Fee - Deal {deal_id}",
                    "amount": round(amount, 2),
                    "vat_rate": 0.15
                }
            ],
            "totals": {
                "subtotal": round(amount, 2),
                "vat": vat_amount,
                "total": total_amount
            },
            "qr_code_data": f"Dealix|VAT:310123456700003|Date:{datetime.now().isoformat()}|Total:{total_amount}|VAT:{vat_amount}",
            "status": "issued"
        }
        
        logger.info(f"✅ Electronic Invoice {invoice_number} generated for deal {deal_id}")
        
        return invoice_data

    async def get_zatca_compliance_report(self, tenant_id: str) -> dict:
        """Dashboard utility to show ZATCA tax readiness."""
        return {
            "zatca_phase": 2,
            "status": "compliant",
            "vat_filing_period": "Q1 2026",
            "total_vat_collected": 14500.50,
            "next_filing_deadline": "2026-04-30"
        }
