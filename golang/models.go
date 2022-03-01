package dtnb
// The nested primary validator info within a bank node's config.
type PrimaryValidatorInfo struct {AccountNumber string `json:"account_number"`
IpAddress string `json:"ip_address"`
NodeIdentifier string `json:"node_identifier"`
Port int32 `json:"port"`
Protocol string `json:"protocol"`
Version string `json:"version"`
DefaultTransactionFee float32 `json:"default_transaction_fee"`
RootAccountFile string `json:"root_account_file"`
RootAccountFileHash string `json:"root_account_file_hash"`
SeedBlockIdentifier string `json:"seed_block_identifier"`
DailyConfirmationRate float32 `json:"daily_confirmation_rate"`
Trust string `json:"trust"`}// The config of a bank node.
type BankConfig struct {PrimaryValidator PrimaryValidatorInfo `json:"primary_validator"`
AccountNumber string `json:"account_number"`
IpAddress string `json:"ip_address"`
NodeIdentifier string `json:"node_identifier"`
Port int32 `json:"port"`
Protocol string `json:"protocol"`
Version string `json:"version"`
DefaultTransactionFee float32 `json:"default_transaction_fee"`
NodeType string `json:"node_type"`}// The config of a primary validator node.
type PrimaryValidatorConfig struct {AccountNumber string `json:"account_number"`
IpAddress string `json:"ip_address"`
// The public key associated with the primary validator node on the network.
NodeIdentifier string `json:"node_identifier"`
Port int32 `json:"port"`
Protocol string `json:"protocol"`
Version string `json:"version"`
DefaultTransactionFee float32 `json:"default_transaction_fee"`
RootAccountFile string `json:"root_account_file"`
RootAccountFileHash string `json:"root_account_file_hash"`
SeedBlockIdentifier string `json:"seed_block_identifier"`
DailyConfirmationRate float32 `json:"daily_confirmation_rate"`
NodeType string `json:"node_type"`}