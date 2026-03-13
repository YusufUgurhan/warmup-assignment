const fs = require("fs");
//helper functions for time conversions:
function timeToSeconds(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [h, m, s] = time.split(':').map(Number);
    if (modifier === 'pm' && h !== 12) h += 12;
    if (modifier === 'am' && h === 12) h = 0;
    return h * 3600 + m * 60 + s;
}

function secondsToHMS(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function hmsToSeconds(duration) {
    const parts = duration.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

const dayNameToNumber = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
};

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    const startSec = timeToSeconds(startTime);
    const endSec = timeToSeconds(endTime);
    return secondsToHMS(endSec - startSec);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    const startSec = timeToSeconds(startTime);
    const endSec = timeToSeconds(endTime);
    const EIGHT_AM = 8 * 3600;
    const TEN_PM = 22 * 3600;
    
    const idleBefore = Math.max(0, Math.min(endSec, EIGHT_AM) - startSec);
    const idleAfter = Math.max(0, endSec - Math.max(startSec, TEN_PM));
    return secondsToHMS(idleBefore + idleAfter);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    const shiftSec = hmsToSeconds(shiftDuration);
    const idleSec = hmsToSeconds(idleTime);
    return secondsToHMS(Math.max(0, shiftSec - idleSec));
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    const [year, month, day] = date.split('-').map(Number);
    const isEid = (year === 2025 && month === 4 && day >= 10 && day <= 30);
    const quotaSec = isEid ? 6 * 3600 : 8 * 3600 + 24 * 60;
    const activeSec = hmsToSeconds(activeTime);
    return activeSec >= quotaSec;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
    function addShiftRecord(textFile, shiftObj) {
        
        let content = '';
        try {
            content = fs.readFileSync(textFile, 'utf8');
        } catch (err) {
        }
        const lines = content.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
            const parts = line.split(',');
            if (parts[0] === shiftObj.driverID && parts[2] === shiftObj.date) {
                return {}; 
        }
        }

        const shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
        const idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
        const activeTime = getActiveTime(shiftDuration, idleTime);
        const metQuotaVal = metQuota(shiftObj.date, activeTime);

        const newRecord = [
            shiftObj.driverID,
            shiftObj.driverName,
            shiftObj.date,
            shiftObj.startTime,
            shiftObj.endTime,
            shiftDuration,
            idleTime,
            activeTime,
            metQuotaVal,
            false
        ].join(',');

        let insertIndex = lines.length;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].startsWith(shiftObj.driverID + ',')) {
                insertIndex = i + 1;
                break;
            }
        }
        lines.splice(insertIndex, 0, newRecord);
        fs.writeFileSync(textFile, lines.join('\n'), 'utf8');

        return {
            driverID: shiftObj.driverID,
            driverName: shiftObj.driverName,
            date: shiftObj.date,
            startTime: shiftObj.startTime,
            endTime: shiftObj.endTime,
            shiftDuration,
            idleTime,
            activeTime,
            metQuota: metQuotaVal,
            hasBonus: false
        };
    }

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
