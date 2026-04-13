import unittest
from datetime import date

from main import calc_end_date


class CalcEndDateUnitTests(unittest.TestCase):
    def test_add_1_month_regular_date(self):
        self.assertEqual(calc_end_date(date(2024, 3, 15), 1), date(2024, 4, 15))

    def test_add_1_month_from_end_of_month_leap_year(self):
        self.assertEqual(calc_end_date(date(2024, 1, 31), 1), date(2024, 2, 29))

    def test_add_12_months(self):
        self.assertEqual(calc_end_date(date(2024, 3, 15), 12), date(2025, 3, 15))

    def test_add_6_months_crosses_year_boundary(self):
        self.assertEqual(calc_end_date(date(2024, 10, 31), 6), date(2025, 4, 30))

    def test_invalid_duration_raises_value_error(self):
        with self.assertRaises(ValueError):
            calc_end_date(date(2024, 3, 15), 2)


if __name__ == "__main__":
    unittest.main()
