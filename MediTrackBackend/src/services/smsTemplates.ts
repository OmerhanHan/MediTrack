export const smsTemplates = {
  appointmentCreated: (doctorName: string, date: string, time: string) =>
    `Sayın Hastamız, Dr. ${doctorName} ile ${date} günü saat ${time} için randevunuz oluşturulmuştur. Lütfen 15 dakika önce klinikte olunuz. Sağlıklı günler dileriz. - MediTrack`,

  appointmentReminder: (doctorName: string, time: string) =>
    `Hatırlatma: Yarın saat ${time}'da Dr. ${doctorName} ile randevunuz bulunmaktadır. Gelemeyecekseniz lütfen kliniğe bilgi veriniz. - MediTrack`,

  appointmentCancelled: (doctorName: string, date: string, time: string) =>
    `Sayın Hastamız, ${date} günü saat ${time} için Dr. ${doctorName} ile olan randevunuz iptal edilmiştir. Yeni randevu almak için klinik ile iletişime geçebilirsiniz. - MediTrack`
};
