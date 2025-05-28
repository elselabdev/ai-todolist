export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export const formatDueDateTime = (dueDate?: string | null, dueTime?: string | null) => {
  if (!dueDate) return null
  
  const date = new Date(dueDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  let dateStr = ""
  if (date.toDateString() === today.toDateString()) {
    dateStr = "Today"
  } else if (date.toDateString() === tomorrow.toDateString()) {
    dateStr = "Tomorrow"
  } else {
    dateStr = date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
    })
  }
  
  if (dueTime) {
    const [hours, minutes] = dueTime.split(":")
    const timeDate = new Date()
    timeDate.setHours(parseInt(hours), parseInt(minutes))
    const timeStr = timeDate.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    })
    return `${dateStr} at ${timeStr}`
  }
  
  return dateStr
}

export const isDueSoon = (dueDate?: string | null, dueTime?: string | null) => {
  if (!dueDate) return false
  
  const now = new Date()
  const due = new Date(dueDate)
  
  if (dueTime) {
    const [hours, minutes] = dueTime.split(":")
    due.setHours(parseInt(hours), parseInt(minutes))
  } else {
    due.setHours(23, 59, 59) // End of day if no time specified
  }
  
  const timeDiff = due.getTime() - now.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  
  return hoursDiff <= 24 && hoursDiff > 0 // Due within 24 hours
}

export const isOverdue = (dueDate?: string | null, dueTime?: string | null) => {
  if (!dueDate) return false
  
  const now = new Date()
  const due = new Date(dueDate)
  
  if (dueTime) {
    const [hours, minutes] = dueTime.split(":")
    due.setHours(parseInt(hours), parseInt(minutes))
  } else {
    due.setHours(23, 59, 59) // End of day if no time specified
  }
  
  return due.getTime() < now.getTime()
}
