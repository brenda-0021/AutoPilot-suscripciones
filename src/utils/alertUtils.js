export function checkForAlerts(subscriptions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignorar horas, minutos y segundos
  const alerts = [];

  subscriptions.forEach((sub) => {
    if (!sub.paymentDate || !sub.reminder) return;

    // Convertir paymentDate de Firebase Timestamp a JavaScript Date
    let paymentDate;
    if (sub.paymentDate.toDate) {
      paymentDate = sub.paymentDate.toDate(); // Firebase Timestamp -> Date
    } else {
      paymentDate = new Date(sub.paymentDate); // Si ya es Date
    }

    const reminderDays = parseInt(sub.reminder, 10) || 0;

    if (isNaN(paymentDate.getTime())) {
      console.error("Invalid paymentDate:", sub.paymentDate);
      return;
    }

    // Calcular fecha de alerta
    const alertDate = new Date(paymentDate);
    alertDate.setDate(alertDate.getDate() - reminderDays);
    alertDate.setHours(0, 0, 0, 0); // Asegurar formato sin tiempo

    console.log("Subscription:", sub);
    console.log("paymentDate:", paymentDate);
    console.log("alertDate:", alertDate);
    console.log("today:", today);

    // Comparar solo año, mes y día
    if (
      today.getFullYear() === alertDate.getFullYear() &&
      today.getMonth() === alertDate.getMonth() &&
      today.getDate() === alertDate.getDate()
    ) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        message: `${sub.platformName} payment due in ${reminderDays} day${
          reminderDays !== 1 ? "s" : ""
        }.`,
      });
    }
  });

  return alerts;
}
