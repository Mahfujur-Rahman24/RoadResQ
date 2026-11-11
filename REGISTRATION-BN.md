# RoadResQ: Responder ও Hospital Registration (বাংলা)

## প্রথমবার চালু করার আগে

1. MongoDB Atlas-এ একটি Database User তৈরি করুন এবং Network Access-এ আপনার IP allow করুন।
2. `server/.env.example` ফাইলটি কপি করে `server/.env` নামে রাখুন।
3. `MONGO_URI`-তে Atlas-এর connection string দিন। URI-তে database name হিসেবে `roadresq` ব্যবহার করুন।
4. `JWT_SECRET`-এ দীর্ঘ, random secret দিন। আসল `.env` কখনো GitHub-এ দেবেন না।
5. `client/.env.example` কপি করে `client/.env` বানান। সাধারণ local setup-এ:
   `VITE_API_URL=http://localhost:5000/api`
6. Project root terminal-এ `npm run install:all` চালান।
7. Project root terminal-এ `npm run dev` চালান।
8. Browser-এ `http://localhost:5173` খুলুন।

## Responder account তৈরি

1. Homepage-এর **Responder Portal** card-এ ক্লিক করুন অথবা `/register?role=responder` খুলুন।
2. Contact person name, organization/service name, responder type, email এবং কমপক্ষে ৮ অক্ষরের password দিন।
3. **Create account** চাপুন।
4. সফল হলে account MongoDB Atlas-এর `users` collection-এ save হবে এবং Responder Dashboard খুলবে।
5. পরে `/login` থেকে একই email/password ও Emergency responder portal বেছে login করুন।

## Hospital account তৈরি

1. Homepage-এর **Hospital Portal** card-এ ক্লিক করুন অথবা `/register?role=hospital` খুলুন।
2. Contact person name, hospital name, email এবং কমপক্ষে ৮ অক্ষরের password দিন।
3. **Create account** চাপুন।
4. সফল হলে account MongoDB Atlas-এর `users` collection-এ save হবে এবং Hospital Dashboard খুলবে।
5. পরে `/login` থেকে একই email/password ও Hospital portal বেছে login করুন।

## গুরুত্বপূর্ণ

- Public registration দিয়ে শুধু `responder` ও `hospital` account তৈরি করা যায়। Admin self-registration বন্ধ।
- Password plaintext হিসেবে রাখা হয় না; bcrypt hash হিসেবে MongoDB-তে save হয়।
- এই demo build-এ নতুন responder/hospital account registration-এর পরই active হয়। Public production-এ ব্যবহারের আগে Admin approval, email verification, rate limiting, HTTPS, audit log এবং আরও security review যোগ করতে হবে।
- Real patient information বা real emergency dispatch-এর জন্য এই academic/demo project ব্যবহার করবেন না।
