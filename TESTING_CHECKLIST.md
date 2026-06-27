# 🧪 Post-Configuration Testing Checklist

**Execute after completing Auth URLs, First User, and Storage setup**

---

## 1. Test Authentication (2 minutes)

### Admin Login
- [ ] Visit: https://ryotaqc-web.vercel.app/admin/login
- [ ] Enter credentials dari Supabase dashboard
- [ ] Should redirect ke `/admin/dashboard`
- [ ] Check: Username displayed di navbar
- [ ] Check: All menu items accessible

**Expected:** ✅ Login successful, dashboard loads

**If Failed:**
- Check Auth URLs configured correctly
- Verify user email confirmed (auto confirm ON)
- Check browser console for errors
- Try incognito/private mode

---

## 2. Test Admin Panel Features (3 minutes)

### Dashboard
- [ ] Visit: `/admin/dashboard`
- [ ] Check: Statistics display (may show 0 - normal for empty DB)
- [ ] Check: Recent activity section loads
- [ ] Check: Quick actions visible

### Content Management
- [ ] Visit: `/admin/articles`
- [ ] Check: Empty state displays correctly
- [ ] Click: "New Article" button
- [ ] Check: Form loads with all fields

### Media Library
- [ ] Visit: `/admin/media`
- [ ] Try: Upload image (will fail if storage not configured)
- [ ] Check: Error message if storage missing
- [ ] After storage setup: Upload succeeds

**Expected:** ✅ All pages load, forms functional

---

## 3. Test AI Chat (2 minutes)

- [ ] Visit: https://ryotaqc-web.vercel.app/ai
- [ ] Type: "Cara cek battery health laptop?"
- [ ] Click: "Tanya" button
- [ ] Wait: Response from RyotaCode AI
- [ ] Check: Response in Bahasa Indonesia
- [ ] Check: Response relevant to QC topic

**Expected:** ✅ AI responds within 3-5 seconds

**If Failed:**
- Check browser console for errors
- Verify AI API URL: http://43.157.203.161:20128/v1
- Test AI endpoint separately
- Check Vercel function logs

---

## 4. Test Public Features (3 minutes)

### Homepage
- [ ] Visit: https://ryotaqc-web.vercel.app
- [ ] Check: Hero section loads
- [ ] Check: All images display
- [ ] Check: Stats strip shows numbers
- [ ] Check: 8 feature cards visible
- [ ] Click: Each feature card navigates correctly

### Prosedur Page
- [ ] Visit: `/prosedur`
- [ ] Check: 20 steps load from database
- [ ] Check: Images display correctly
- [ ] Check: Status badges visible

### SOP Page
- [ ] Visit: `/sop`
- [ ] Check: 11 categories display
- [ ] Click: Any category (e.g., `/sop/battery`)
- [ ] Check: Detail page loads

### Quiz Page
- [ ] Visit: `/quiz`
- [ ] Check: 4 level cards display
- [ ] Click: "Dasar" level
- [ ] Check: Questions load
- [ ] Answer: A few questions
- [ ] Check: Score calculation works

**Expected:** ✅ All public pages functional

---

## 5. Test Responsive Design (2 minutes)

- [ ] Open: Chrome DevTools (F12)
- [ ] Toggle: Device toolbar (Ctrl+Shift+M)
- [ ] Test: Mobile view (375px)
- [ ] Test: Tablet view (768px)
- [ ] Check: Navbar collapses to hamburger menu
- [ ] Check: All content readable
- [ ] Check: No horizontal scroll

**Expected:** ✅ Responsive on all devices

---

## 6. Test Dark Mode (1 minute)

- [ ] Click: Theme toggle button (moon/sun icon)
- [ ] Check: Colors switch to dark theme
- [ ] Check: All text readable
- [ ] Check: Images have proper contrast
- [ ] Toggle: Back to light mode
- [ ] Check: Theme persists on reload

**Expected:** ✅ Smooth theme switching

---

## 7. Performance Check (2 minutes)

### Lighthouse Score
- [ ] Open: Chrome DevTools → Lighthouse tab
- [ ] Run: Desktop audit
- [ ] Check: Performance score >80
- [ ] Check: Accessibility score >90
- [ ] Check: Best Practices score >80
- [ ] Check: SEO score >90

### Load Time
- [ ] Clear: Browser cache
- [ ] Reload: Homepage
- [ ] Measure: Load time <3 seconds
- [ ] Check: No console errors
- [ ] Check: No 404s in Network tab

**Expected:** ✅ Fast load, good scores

---

## 🐛 Common Issues & Fixes

### Issue: "Supabase connection error"
**Fix:**
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Check network connectivity

### Issue: "AI not responding"
**Fix:**
- Verify AI API endpoint is accessible
- Check API key is valid
- Look at Vercel function logs

### Issue: "Media upload fails"
**Fix:**
- Verify storage bucket created
- Check bucket is public
- Verify RLS policies allow upload

### Issue: "Admin pages show 403 Forbidden"
**Fix:**
- Verify user has role in `user_roles` table
- Check RLS policies on tables
- Re-login to refresh session

---

## ✅ Success Criteria

All tests passing means:
- ✅ Authentication working
- ✅ Database queries working
- ✅ AI integration working
- ✅ Storage working
- ✅ UI/UX smooth
- ✅ Performance good
- ✅ Security policies active

**Next:** Start adding real content!

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

[ ] Auth: Login successful
[ ] Admin: Dashboard loads
[ ] AI: Responds correctly  
[ ] Public: All pages work
[ ] Mobile: Responsive
[ ] Dark mode: Works
[ ] Performance: Good

Issues found: ___________
___________________________
___________________________

Overall Status: PASS / FAIL
```
