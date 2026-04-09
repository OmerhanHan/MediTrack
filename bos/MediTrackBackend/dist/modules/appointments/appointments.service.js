const appointments = [];
export function listAppointments(doctorId) {
    return appointments.filter((item) => item.doctorId === doctorId);
}
export function createAppointment(doctorId, payload) {
    const conflict = appointments.find((item) => item.doctorId === doctorId && item.date === payload.date && item.time === payload.time);
    if (conflict) {
        throw new Error('APPOINTMENT_CONFLICT');
    }
    const appointment = {
        id: `apt-${appointments.length + 1}`,
        doctorId,
        patientName: payload.patientName,
        phone: payload.phone,
        date: payload.date,
        time: payload.time,
        notes: payload.notes ?? '',
        createdAt: new Date().toISOString(),
    };
    appointments.push(appointment);
    return appointment;
}
