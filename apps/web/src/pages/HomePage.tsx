import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/**
 * Home Page Component
 *
 * Main landing page with navigation, hero section, and call-to-action buttons.
 * Includes SEO optimization and accessibility features.
 *
 * @version 1.0.0
 * @created 2024-01-20
 * @updated 2024-01-20
 * @author Kim Hsiao
 */
const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>SoulMatting - AI-Powered Image Matting</title>
        <meta
          name='description'
          content='Advanced AI-powered image matting and background removal service. Remove backgrounds from images with precision and ease.'
        />
        <meta
          name='keywords'
          content='image matting, background removal, AI, photo editing, image processing'
        />
        <meta
          property='og:title'
          content='SoulMatting - AI-Powered Image Matting'
        />
        <meta
          property='og:description'
          content='Advanced AI-powered image matting and background removal service.'
        />
        <meta property='og:type' content='website' />
      </Helmet>

      <div className='min-h-screen bg-white'>
        {/* Navigation */}
        <nav className='bg-white shadow-sm' data-testid='main-navigation'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between h-16'>
              <div className='flex items-center'>
                <Link to='/' className='flex-shrink-0'>
                  <h1 className='text-2xl font-bold text-indigo-600'>
                    SoulMatting
                  </h1>
                </Link>
              </div>

              <div className='flex items-center space-x-4'>
                <Link
                  to='/about'
                  className='text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
                  data-testid='about-link'
                >
                  About
                </Link>
                <Link
                  to='/features'
                  className='text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
                  data-testid='features-link'
                >
                  Features
                </Link>
                <Link
                  to='/pricing'
                  className='text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
                  data-testid='pricing-link'
                >
                  Pricing
                </Link>
                <Link
                  to='/login'
                  className='text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
                  data-testid='login-link'
                >
                  Sign In
                </Link>
                <Link
                  to='/register'
                  className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'
                  data-testid='register-link'
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center'>
            <h1 className='text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl'>
              <span className='block'>AI-Powered</span>
              <span className='block text-indigo-600'>Image Matting</span>
            </h1>

            <p className='mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
              Remove backgrounds from images with precision using advanced AI
              technology. Perfect for e-commerce, photography, and creative
              projects.
            </p>

            <div className='mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8'>
              <div className='rounded-md shadow'>
                <Link
                  to='/upload'
                  className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10'
                  data-testid='get-started-cta'
                >
                  Get Started Free
                </Link>
              </div>

              <div className='mt-3 rounded-md shadow sm:mt-0 sm:ml-3'>
                <Link
                  to='/demo'
                  className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10'
                  data-testid='try-demo-cta'
                >
                  Try Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className='mt-20'>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='text-center'>
                <div className='flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h3 className='mt-4 text-lg font-medium text-gray-900'>
                  Lightning Fast
                </h3>
                <p className='mt-2 text-base text-gray-500'>
                  Process images in seconds with our optimized AI algorithms.
                </p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='mt-4 text-lg font-medium text-gray-900'>
                  High Precision
                </h3>
                <p className='mt-2 text-base text-gray-500'>
                  Advanced AI ensures accurate edge detection and clean results.
                </p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
                <h3 className='mt-4 text-lg font-medium text-gray-900'>
                  Secure & Private
                </h3>
                <p className='mt-2 text-gray-500'>
                  Your images are processed securely and never stored
                  permanently.
                </p>
              </div>
            </div>
          </div>

          {/* Sample Images */}
          <div className='mt-20'>
            <h2 className='text-3xl font-extrabold text-gray-900 text-center mb-8'>
              See the Difference
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='text-center'>
                <img
                  src='/api/placeholder/400/300'
                  alt='Original image with background'
                  className='rounded-lg shadow-lg mx-auto'
                  data-testid='sample-image-before'
                />
                <p className='mt-2 text-sm text-gray-600'>
                  Before: Original Image
                </p>
              </div>
              <div className='text-center'>
                <img
                  src='/api/placeholder/400/300'
                  alt='Image with background removed'
                  className='rounded-lg shadow-lg mx-auto'
                  data-testid='sample-image-after'
                />
                <p className='mt-2 text-sm text-gray-600'>
                  After: Background Removed
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className='bg-gray-50 mt-20'>
          <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <p className='text-base text-gray-500'>
                © 2024 SoulMatting. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
