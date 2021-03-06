#version 460 core

layout(location = 0) out vec4 color;

uniform unsigned int frame;
uniform vec4 screenRect;

// interpolate a in [b, c] to [d, e]
double map(double a, double b, double c, double d, double e)
{
	return (a - b) / (c - b) * (e - d) + d;
}

dvec4 getMandelBounds()
{
	dvec2 target = dvec2(0.250999571, 0.000050039885);
	float zoomRate = 0.9;

	double xmin0 = -2;
	double xmax0 = 2;
	double ymin0 = (xmin0 - xmax0) / 2 * screenRect.w / screenRect.z;
	double ymax0 = -ymin0;

	double zoom = pow(zoomRate, float(frame) / 2);
	zoom = zoom * zoom;

	return dvec4(
		map(zoom, 1, 0, xmin0, target.x),
		map(zoom, 1, 0, ymin0, target.y),
		map(zoom, 1, 0, xmax0, target.x),
		map(zoom, 1, 0, ymax0, target.y)
	);
}

dvec2 getCoord(dvec4 mandelBounds)
{
	return dvec2(
		map(gl_FragCoord.x, screenRect.x, screenRect.x + screenRect.z, mandelBounds.x, mandelBounds.z),
		map(gl_FragCoord.y, screenRect.y, screenRect.y + screenRect.w, mandelBounds.y, mandelBounds.w)
	);
}

unsigned int mandelbrot(dvec2 z0, unsigned int maxIterations)
{
	unsigned int iterations = 0u;
	dvec2 z;
	double temp;

	while (iterations != maxIterations && z.x * z.x + z.y * z.y < 2)
	{
		temp = z.x * z.x - z.y * z.y + z0.x;
		z.y = 2 * z.x * z.y + z0.y;
		z.x = temp;
		iterations++;
	}

	return iterations;
}

vec4 colorFromIterations(unsigned int iterations, unsigned int maxIterations)
{
	if (iterations == maxIterations)
		return vec4(0.0, 0.0, 0.0, 0.0);

	float t = float(iterations) / 500.0;
		
	return vec4(
		(1.0 - cos(200 * t)) / 2.0,
		(1.0 - cos(200 * t + 1.0)) / 2.0,
		(1.0 + sin(200 * t)) / 2.0,
		1.0
	);
}

void main()
{
	unsigned int maxIterations = 1000;

	dvec4 mandelBounds = getMandelBounds();
	dvec2 z0 = getCoord(mandelBounds);
	unsigned int iterations = mandelbrot(z0, maxIterations);
	color = colorFromIterations(iterations, maxIterations);
}
