function waitTime(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitInitOfNextMinute() {
    const currentSecond = new Date().getSeconds();
    const timeToExecute = (60001) - (currentSecond * 1000);

    return waitTime(timeToExecute);
}

module.exports = {
    waitTime,
    waitInitOfNextMinute
}

