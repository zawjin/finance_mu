import asyncio
import httpx
import urllib.parse
async def test():
    eng_text = "Each day offers a reason to celebrate. Find it and experience true bliss."
    try:
        trans_url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q={urllib.parse.quote(eng_text)}"
        trans_headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        async with httpx.AsyncClient() as client:
            trans_res = await client.get(trans_url, headers=trans_headers, timeout=10.0)
            if trans_res.status_code == 200:
                parts = trans_res.json()[0]
                tamil_text = "".join([str(part[0]) for part in parts if part[0]])
                print("Tamil:", tamil_text)
            else:
                raise Exception(f"Translate API Error: {trans_res.status_code}")
    except Exception as te:
        import traceback
        traceback.print_exc()

asyncio.run(test())
