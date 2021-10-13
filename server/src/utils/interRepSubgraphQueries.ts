
export const getGroupMetadata = (groupId: string) => {

    return `
    {
        group(id:"${groupId}") {
            id
            name
            leafCount
            memberCount
          }
    }
    `

}

export const getAllLeaves = (groupId: string, first: number = 100, skip: number = 0) => {


    return `
    {
        group(id:"${groupId}") {
          id
          name
          leafCount
          memberCount,
          members(first:${first}, skip:${skip}, orderBy:leafIndex, orderDirection:asc) {
            leafIndex
            identityCommitment
          }
        }
      }
    `


}

export const getLatestLeaves = (groupId: string, latest: number = 100) => {

    return `
    {
        group(id:"${groupId}") {
          id
          name
          leafCount
          memberCount,
          members(first:${latest}, orderBy:leafIndex, orderDirection:desc) {
            leafIndex
            identityCommitment
          }
        }
      }
    `


}

export const getGroups = (first: number = 100) => {

    return `
    {
        groups(first:${first}) {
          id
          name
          leafCount
          memberCount
        }
    }`


}