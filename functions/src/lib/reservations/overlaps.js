import {TODAY, CORS_WEB_URL} from "../constants"
import {subDays } from "date-fns"
import { RESERVATIONS_FS, ROOMS_DB } from "../firebase"

/**
 * Return overlaps for a room
 */
export async function getOverlaps({query: {roomId}}, res) {
  res.setHeader("Access-Control-Allow-Origin", CORS_WEB_URL)
  const overlaps = []
  
  const unavailable = await ROOMS_DB.child(`${roomId - 1}/unavailable`).once("value")
  
  const reservations = await RESERVATIONS_FS
    .where("roomId", "array-contains", parseInt(roomId, 10))
    .where("to", ">=", subDays(TODAY, 1))
    .get()

  if (unavailable.exists()) {
    overlaps.push({start: TODAY, end: new Date(unavailable.val())})
  }
  if (!reservations.empty) {
    reservations.forEach(reservation => {
      const {from, to} = reservation.data()
      overlaps.push({start: from.toDate(), end: to.toDate()})
    })
  }

  return res.send(JSON.stringify(overlaps))

}

