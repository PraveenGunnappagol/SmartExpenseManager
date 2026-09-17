#include "utils/PasswordUtils.h"

#include <windows.h>
#include <bcrypt.h>

#include <iomanip>
#include <sstream>
#include <vector>

#pragma comment(lib, "bcrypt.lib")

std::string hashPassword(const std::string& password)
{
    BCRYPT_ALG_HANDLE algorithm = nullptr;
    BCRYPT_HASH_HANDLE hashHandle = nullptr;

    NTSTATUS status = BCryptOpenAlgorithmProvider(
        &algorithm,
        BCRYPT_SHA256_ALGORITHM,
        nullptr,
        0
    );

    if (status != 0)
    {
        return "";
    }

    DWORD objectSize = 0;
    DWORD resultSize = 0;

    status = BCryptGetProperty(
        algorithm,
        BCRYPT_OBJECT_LENGTH,
        reinterpret_cast<PUCHAR>(&objectSize),
        sizeof(objectSize),
        &resultSize,
        0
    );

    if (status != 0)
    {
        BCryptCloseAlgorithmProvider(algorithm, 0);
        return "";
    }

    std::vector<unsigned char> hashObject(objectSize);

    status = BCryptCreateHash(
        algorithm,
        &hashHandle,
        hashObject.data(),
        objectSize,
        nullptr,
        0,
        0
    );

    if (status != 0)
    {
        BCryptCloseAlgorithmProvider(algorithm, 0);
        return "";
    }

    status = BCryptHashData(
        hashHandle,
        reinterpret_cast<PUCHAR>(
            const_cast<char*>(password.data())
        ),
        static_cast<ULONG>(password.size()),
        0
    );

    if (status != 0)
    {
        BCryptDestroyHash(hashHandle);
        BCryptCloseAlgorithmProvider(algorithm, 0);
        return "";
    }

    std::vector<unsigned char> hash(32);

    status = BCryptFinishHash(
        hashHandle,
        hash.data(),
        static_cast<ULONG>(hash.size()),
        0
    );

    BCryptDestroyHash(hashHandle);
    BCryptCloseAlgorithmProvider(algorithm, 0);

    if (status != 0)
    {
        return "";
    }

    std::stringstream result;

    for (unsigned char byte : hash)
    {
        result << std::hex
               << std::setw(2)
               << std::setfill('0')
               << static_cast<int>(byte);
    }

    return result.str();
}