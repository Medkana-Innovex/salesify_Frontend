import client from './client'

export const listBranches = () => client.get('/branches')
