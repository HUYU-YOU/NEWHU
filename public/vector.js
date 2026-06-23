JavaScript
const emotionsData = [
    { name: 'Joie', color: '#FFD700', angle: 0 }, { name: 'Amour', color: '#FF69B4', angle: 45 },
    { name: 'SOS', color: '#FF0000', angle: 90 }, { name: 'Tristesse', color: '#4682B4', angle: 135 },
    { name: 'Surprise', color: '#FF8C00', angle: 180 }, { name: 'Peur', color: '#9370DB', angle: 225 },
    { name: 'Dégoût', color: '#556B2F', angle: 270 }, { name: 'Colère', color: '#B22222', angle: 315 }
];

function drawVectorWheel() {
    const canvas = document.getElementById('emotion-wheel');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 200, cy = 200;
    ctx.clearRect(0, 0, 400, 400);

    emotionsData.forEach((emo) => {
        const rad = (emo.angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 150, rad, rad + (Math.PI / 4));
        ctx.lineTo(cx, cy);
        ctx.fillStyle = emo.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    });
}
