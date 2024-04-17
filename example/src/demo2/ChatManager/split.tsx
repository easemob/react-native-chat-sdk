export function splitApiList(apiList: string[]) {
  const threadList = [];
  const messageList = [];
  const otherList = [];

  for (const item of apiList) {
    if (item.toLowerCase().includes('thread')) {
      threadList.push(item);
    } else if (item.toLowerCase().includes('message')) {
      messageList.push(item);
    } else {
      otherList.push(item);
    }
  }

  return [threadList, messageList, otherList];
}
