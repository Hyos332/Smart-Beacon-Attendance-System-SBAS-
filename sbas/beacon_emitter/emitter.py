import asyncio
from bleak import BleakAdvertiser

async def main():
    advertiser = BleakAdvertiser()
    await advertiser.start(
        advertising_data={
            "local_name": "Aula101",
            "service_uuids": ["12345678-1234-5678-1234-56789abcdef0"]
        }
    )
    print("Beacon emitiendo en Aula 101...")
    await asyncio.sleep(300)
    await advertiser.stop()

if __name__ == "__main__":
    asyncio.run(main())
