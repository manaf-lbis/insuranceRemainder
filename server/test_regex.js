
const testUrls = [
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Standard versioned
    'https://res.cloudinary.com/demo/image/upload/w_300,c_fill/v1312461204/sample.jpg', // Versioned with transforms
    'https://res.cloudinary.com/demo/image/upload/c_fill,w_500,h_500/v123456789/my_image.png', // Complex transforms
    'https://res.cloudinary.com/demo/image/upload/sample.jpg', // No version, no transforms
    'https://res.cloudinary.com/demo/image/upload/w_500/sample.jpg', // No version, with transforms
];

function transformUrl(firstImage) {
    let finalImageUrl = firstImage;
    if (firstImage && firstImage.includes('cloudinary.com') && firstImage.includes('/upload/')) {
        const versionMatch = firstImage.match(/\/upload\/(.*)\/v(\d+)\//);

        if (versionMatch) {
            console.log(`[MATCH] ${firstImage}`);
            console.log(`   Group 1 (Transforms): "${versionMatch[1]}"`);
            console.log(`   Group 2 (Version): "${versionMatch[2]}"`);
            finalImageUrl = firstImage.replace(/\/upload\/.*\/v\d+\//, `/upload/w_1200,h_630,c_pad,b_blurred:400,q_50,f_jpg/v${versionMatch[2]}/`);
        } else {
            console.log(`[NO MATCH] ${firstImage}`);
            finalImageUrl = firstImage.replace('/upload/', '/upload/w_1200,h_630,c_pad,b_blurred:400,q_50,f_jpg/');
        }
    }
    return finalImageUrl;
}

testUrls.forEach(url => {
    console.log(`Original: ${url}`);
    console.log(`Final:    ${transformUrl(url)}`);
    console.log('---');
});
