export const sleep = async (time: number): Promise<undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
