package services

// TokenKey là key để lưu và lấy token từ context
type TokenKey struct{}

// TokenKeyValue là instance của TokenKey để sử dụng trong context
var TokenKeyValue = TokenKey{}
