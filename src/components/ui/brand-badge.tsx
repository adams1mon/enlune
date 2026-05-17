function BrandLogo() {
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      className="h-4 w-4 text-white/80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.2127 0C19.9689 0 24.9255 3.37099 27.1599 8.218C25.2113 5.25498 21.8257 3.29414 17.9749 3.29412C11.9347 3.29412 7.03817 8.11741 7.03817 14.0672C7.03821 20.0169 11.9348 24.8402 17.9749 24.8402C21.6825 24.8402 24.9584 23.0221 26.9362 20.2424C24.6065 24.8409 19.7847 28 14.2127 28C6.36324 28 0 21.732 0 14C0 6.26801 6.36324 0 14.2127 0Z"
        fill="currentColor"
      />
      <path
        d="M19.2253 5.35294C24.0714 5.35294 28 9.22273 28 13.9964C28 18.7701 24.0715 22.6398 19.2253 22.6398C14.3791 22.6398 10.4505 18.77 10.4505 13.9964C10.4506 9.22276 14.3791 5.35299 19.2253 5.35294ZM19.2289 8.64706C16.2277 8.64706 13.7947 11.0437 13.7947 14C13.7947 16.9563 16.2277 19.3529 19.2289 19.3529C22.2302 19.3529 24.6632 16.9563 24.6632 14C24.6632 11.0437 22.2302 8.64706 19.2289 8.64706Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BrandBadge() {
  return (
    <div className="flex items-center gap-2 rounded-full px-[0.85rem] py-[0.28rem]">
      <BrandLogo />
      <span className="font-display text-[1.2rem] font-bold tracking-tight text-white/80">
        enlune
      </span>
    </div>
  );
}
