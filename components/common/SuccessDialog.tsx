'use client';

import { CheckCircle2, Sparkles, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import { useRouter } from 'next/navigation';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  applicantName: string;
  position: string;
  locale: string;
}

export function SuccessDialog({ open, onClose, applicantName, position, locale }: SuccessDialogProps) {
  const router = useRouter();
  const isArabic = locale === 'ar';

  const handleGoBack = () => {
    onClose();
    router.push(`/${locale}/careers`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center space-y-6 py-6">
          {/* Success Icon with Animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 shadow-lg">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-bounce" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {isArabic ? '✨ تم إرسال طلبك بنجاح!' : '✨ Application Submitted Successfully!'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {isArabic ? (
                <>
                  عزيزي <span className="font-semibold text-foreground">{applicantName}</span>
                </>
              ) : (
                <>
                  Dear <span className="font-semibold text-foreground">{applicantName}</span>
                </>
              )}
            </DialogDescription>
          </div>

          {/* Message Card */}
          <div className="w-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="text-start flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  {isArabic ? 'تأكيد الاستلام' : 'Confirmation'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isArabic
                    ? 'لقد استلمنا طلبك للتقديم على وظيفة'
                    : 'We have received your application for'}
                  {' '}
                  <span className="font-semibold text-foreground">{position}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-start flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  {isArabic ? 'الخطوات القادمة' : 'Next Steps'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isArabic
                    ? 'سيقوم فريق الموارد البشرية بمراجعة طلبك والتواصل معك خلال 3-5 أيام عمل'
                    : 'Our HR team will review your application and contact you within 3-5 business days'}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Note */}
          <div className="w-full p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic ? (
                <>
                  💡 <span className="font-medium">نصيحة:</span> يرجى التحقق من بريدك الإلكتروني بانتظام (بما في ذلك مجلد البريد العشوائي).
                  سنرسل لك تحديثات حول حالة طلبك.
                </>
              ) : (
                <>
                  💡 <span className="font-medium">Tip:</span> Please check your email regularly (including spam folder).
                  We&apos;ll send you updates about your application status.
                </>
              )}
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleGoBack}
            size="lg"
            className="w-full group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isArabic ? 'العودة إلى صفحة الوظائف' : 'Back to Careers'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
















