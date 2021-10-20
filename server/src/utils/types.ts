enum SocketEventType {
  USER_REGISTERED = "userRegistered", // event emitted by the server to all of the clients when new user registers successfully
  USER_SLASHED = "userSlashed", // event emitted by the server to the clients when user is slashed
  GET_WITNESS = "getWitness", // event emitted by the clients when they need to obtain a new witness (when new user is added or user is slashed)
}

enum RedirectVerificationStatus {
  DUPLICATE = "duplicate", // the redirect is duplicate, we should not process it further
  SPAM = "spam", // the redirect is considered as spam, the user should be slashed
  INVALID = "invalid", // the proof is invalid, the redirect should be discarded
  VALID = "valid", // the redirect is valid, it should be processed further
}

// Inputs received by the users, for rate-limiting verification
interface RedirectMessage {
  proof: string; // RLN proof
  nullifier: string;
  url: string; // the url is the signal
  epoch: string;
  groupId: string; // InterRep group id
  yShare: string; // the xShare is the hash of the content, so we don't need to send that
  rlnIdentifier: string;
}
export { RedirectMessage, RedirectVerificationStatus, SocketEventType};