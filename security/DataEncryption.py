from cryptography.fernet import Fernet

class DataEncryptor:
    def __init__(self, key=None):
        self.key = key or Fernet.generate_key()
        self.cipher_suite = Fernet(self.key)

    def encrypt_data(self, data):
        if isinstance(data, str):
            data = data.encode('utf-8')
        encrypted_data = self.cipher_suite.encrypt(data)
        return encrypted_data

    def decrypt_data(self, encrypted_data):
        decrypted_data = self.cipher_suite.decrypt(encrypted_data)
        return decrypted_data.decode('utf-8')

if __name__ == "__main__":
    encryptor = DataEncryptor()

    data = "Sensitive information"
    encrypted_data = encryptor.encrypt_data(data)
    print(f"Encrypted data: {encrypted_data}")

    decrypted_data = encryptor.decrypt_data(encrypted_data)
    print(f"Decrypted data: {decrypted_data}")
