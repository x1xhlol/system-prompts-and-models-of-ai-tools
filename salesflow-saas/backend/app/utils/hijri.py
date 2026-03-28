from datetime import date


def gregorian_to_hijri_approx(greg_date: date) -> str:
    """Approximate Gregorian to Hijri conversion for display purposes.
    For production, use the hijri-converter package.
    """
    # Approximate calculation
    jd = _greg_to_jd(greg_date.year, greg_date.month, greg_date.day)
    l = jd - 1948440 + 10632
    n = (l - 1) // 10631
    l = l - 10631 * n + 354
    j = ((10985 - l) // 5316) * ((50 * l) // 17719) + (l // 5670) * ((43 * l) // 15238)
    l = l - ((30 - j) // 15) * ((17719 * j) // 50) - (j // 16) * ((15238 * j) // 43) + 29
    m = (24 * l) // 709
    d = l - (709 * m) // 24
    y = 30 * n + j - 30

    months_ar = [
        "", "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
        "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
        "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
    ]

    if 1 <= m <= 12:
        return f"{d} {months_ar[m]} {y}"
    return f"{d}/{m}/{y}"


def _greg_to_jd(y: int, m: int, d: int) -> int:
    return (1461 * (y + 4800 + (m - 14) // 12)) // 4 + (367 * (m - 2 - 12 * ((m - 14) // 12))) // 12 - (3 * ((y + 4900 + (m - 14) // 12) // 100)) // 4 + d - 32075
