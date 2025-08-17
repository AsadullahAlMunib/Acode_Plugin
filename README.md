
# Localhost + phpMyAdmin (Android) — Acode Plugin

> লক্ষ্য: এই প্লাগইনটি নিজে থেকে PHP/MariaDB চালায় না; Android‑এ নেটিভ বাইনারি দরকার।
> এখানে দেওয়া স্ক্রিপ্ট দিয়ে **Termux‑এ মিনিমাল সেটআপ** (one‑time) করবেন, তারপর Acode থেকে এক ক্লিকে phpMyAdmin খুলতে পারবেন।

## কী পাবেন
- htdocs লোকেশন কনফিগার
- লোকাল সার্ভার রান করলে `http://127.0.0.1:<port>/phpmyadmin/` Acode থেকেই ওপেন
- স্টার্ট/স্টপের জন্য রেডিমেড Termux স্ক্রিপ্ট

## ইনস্টল (Acode)
1. এই ZIP ফাইলটি ডাউনলোড করুন এবং Acode → Extensions → Install from file দিয়ে ইনস্টল করুন।
2. সাইডবারে **Localhost** আইকন দেখাবে; ওখান থেকে htdocs path সেট করুন।

## One‑time সেটআপ (Termux — যতটা সম্ভব ছোট)
> শুধু একবার করবেন; এরপর শুধু `start.sh` চালালেই হবে।

1. F‑Droid থেকে Termux ইনস্টল করুন, চালু করে storage পারমিশন নিন:
   ```bash
   termux-setup-storage
   ```
2. এই প্লাগইনের `scripts/` ফোল্ডার থেকে ফাইলগুলো আপনার ফোনে কপি করুন (ধরা হলো `/storage/emulated/0/htdocs` ব্যবহার করবেন)।
3. Termux‑এ নীচেরটি রান করুন (পাথ আপনার মত দিন):
   ```bash
   bash /storage/emulated/0/htdocs/scripts/setup.sh
   ```

এতে হবে:
- `pkg` দিয়ে `php`, `mariadb`, `apache2` (optional) ইনস্টল
- phpMyAdmin ডাউনলোড ও `htdocs/phpmyadmin` এ সেটআপ
- MariaDB init ও root পাসওয়ার্ড সেট
- PHP built‑in server (বা চাইলে apache2) ব্যবহারের প্রস্তুতি

## সার্ভার চালানো/বন্ধ করা
- চালু: 
  ```bash
  bash /storage/emulated/0/htdocs/scripts/start.sh
  ```
- বন্ধ:
  ```bash
  bash /storage/emulated/0/htdocs/scripts/stop.sh
  ```

চালু থাকলে Acode প্লাগইন থেকে:
- **Open phpMyAdmin** → `http://127.0.0.1:8080/phpmyadmin/`
- **Open htdocs index** → `http://127.0.0.1:8080/`

## কাস্টম htdocs লোকেশন
প্লাগইন সেটিংসে যে পাথ দিবেন, সেই পাথই `start.sh` ব্যবহার করবে।
আপনি storage/emulated/0 বা অন্য কোথাও ফোল্ডার বানাতে পারেন।

## নোট
- Android‑এ সরাসরি MySQL/MariaDB ও PHP চালাতে নেটিভ বাইনারি দরকার; তাই Termux ছাড়া সম্পূর্ণ সমাধান বাস্তবে সম্ভব নয়।
- phpMyAdmin হলো PHP অ্যাপ — তাই PHP সার্ভার ছাড়া চলবে না।

---

### scripts/setup.sh কী করে?
- PHP, MariaDB, wget, unzip ইনস্টল
- ডাটাডির INIT, সার্ভিস কনফিগার
- phpMyAdmin (latest stable) ডাউনলোড/এক্সট্র্যাক্ট
- একটি টেস্ট `index.php` লিখে দেয়

### scripts/start.sh কী করে?
- MariaDB সার্ভার চালু করে
- PHP built‑in server `127.0.0.1:8080` এ htdocs সার্ভ করে
- চাইলে Apache2 ব্যবহার করার কমেন্টেড ব্লক আছে

### scripts/stop.sh কী করে?
- চলমান PHP সার্ভারের PID মেরে দেয়
- MariaDB বন্ধ করে
