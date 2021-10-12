import axios from "axios";
import { getGroupMetadata, getAllLeaves, getGroups } from "./interRepSubgraphQueries"


const getLeaves = async () => {
  const result = await axios.get(`${process.env.INTERREP_MOCK_BASE_URL}/leaves`);
  return result.data;
};


const getInterrepGroups = async () => {

  const result = await axios.post(`${process.env.INTERREP_SUBGRAPH_URL}`, {query: getGroups()});
  return result.data.data;

};

const getInterrepGroupMetadata = async (groupId: string) => {

  const result = await axios.post(`${process.env.INTERREP_SUBGRAPH_URL}`, {query: getGroupMetadata(groupId)});
  return result.data.data;

};

const getInterRepLeaves = async (groupId: string, first: number = 100, skip: number = 0) => {

  const result = await axios.post(`${process.env.INTERREP_SUBGRAPH_URL}`, {query: getAllLeaves(groupId, first, skip)});
  return result.data.data;

}


export { getLeaves, getInterrepGroupMetadata, getInterRepLeaves, getInterrepGroups };
